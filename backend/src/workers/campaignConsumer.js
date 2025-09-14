import Redis from 'ioredis';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';
import CommunicationLog from '../models/CommunicationLog.js';
import Campaign from '../models/Campaign.js';

const redis = new Redis(process.env.REDIS_URL);

// --- Utility: turn Redis stream entry into object ---
function parseStreamEntry(fields) {
  const obj = {};
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]] = fields[i + 1];
  }
  return obj;
}

async function processCampaignStart(payload) {
  const { campaign_id, segment_id } = payload;

  const segment = await Segment.findById(new mongoose.Types.ObjectId(segment_id));
  if (!segment) {
    console.warn('Segment not found', segment_id);
    return;
  }

  const { astToMongoQuery } = await import('../utils/ruleEvaluator.js');
  const mongoQuery = astToMongoQuery(
    segment.rules && segment.rules.length ? { op: 'AND', children: segment.rules } : {}
  );
  const cursor = Customer.find(mongoQuery).cursor();

  let batch = [];
  while (true) {
    const doc = await cursor.next();
    if (!doc) break;

    batch.push(doc);
    if (batch.length >= 200) {
      await handleBatch(batch, campaign_id);
      batch = [];
    }
  }

  if (batch.length) await handleBatch(batch, campaign_id);

  const audienceSize = segment.preview_count || 0;
  await Campaign.updateOne({ campaign_id }, { $set: { audienceSize } });
}

async function handleBatch(batch, campaign_id) {
  const logs = batch.map(c => ({
    campaign_id,
    customer_id: c.customer_id,
    channel: 'sms',
    status: 'pending',
    attempts: 0,
  }));

  const inserted = await CommunicationLog.insertMany(logs);

  for (const doc of inserted) {
    const message = {
      communication_log_id: doc._id.toString(),
      customer_id: doc.customer_id,
    };
    await redis.xadd('deliveries', '*', 'payload', JSON.stringify(message));
  }
}

async function consumeCampaignStart() {
  console.log('campaign consumer started');
  let lastId = '0-0';

  while (true) {
    try {
      const res = await redis.xread(
        'BLOCK',
        5000,
        'COUNT',
        1,
        'STREAMS',
        'campaign_start',
        lastId
      );

      if (!res) continue;

      const [, entries] = res[0];
      for (const [id, fields] of entries) {
        const obj = parseStreamEntry(fields);

        if (!obj.payload) {
          console.warn('Missing payload in stream entry:', fields);
          continue;
        }

        try {
          const payload = JSON.parse(obj.payload);
          await processCampaignStart(payload);
          lastId = id;
        } catch (err) {
          console.error('Failed to process payload:', obj.payload, err);
        }
      }
    } catch (err) {
      console.error('campaign consumer error', err);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// --- Ensure DB connects before starting consumer ---
const url = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB || 'minicrm';
async function start() {
  try {
    await mongoose.connect(url, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
    await consumeCampaignStart();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

start();