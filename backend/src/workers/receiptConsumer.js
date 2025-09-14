import Redis from 'ioredis';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import dotenv from 'dotenv';
import CommunicationLog from '../models/CommunicationLog.js';

dotenv.config();
const redis = new Redis(process.env.REDIS_URL);

const BATCH_DELAY_MS = 2000;
const EMPTY_WAIT_MS = 5000;
const STREAM_KEY = 'delivery_receipts';
const LAST_ID_KEY = 'delivery_receipts_last_id';

async function getLastId() {
  const lastId = await redis.get(LAST_ID_KEY);
  return lastId || '0-0';
}

async function setLastId(id) {
  await redis.set(LAST_ID_KEY, id);
}

async function consumeReceipts() {
  console.log('Receipt consumer started');
  let lastId = await getLastId();

  while (true) {
    try {
      const res = await redis.xread(
        'BLOCK', 30000,
        'COUNT', 500,
        'STREAMS',
        STREAM_KEY,
        lastId
      );

      if (!res) {
        await new Promise(r => setTimeout(r, EMPTY_WAIT_MS));
        continue;
      }

      const [, entries] = res[0];
      const updates = [];

      for (const [id, fields] of entries) {
        const obj = {};
        for (let i = 0; i < fields.length; i += 2) {
          obj[fields[i]] = fields[i + 1];
        }

        let payload;
        try {
          payload = JSON.parse(obj.payload);
        } catch (e) {
          console.error('Failed to parse payload for id', id, e.message);
          lastId = id;
          await setLastId(lastId);
          continue;
        }

        if (!payload.communication_log_id || !payload.status) {
          console.warn('Invalid payload, missing fields:', payload);
          lastId = id;
          await setLastId(lastId);
          continue;
        }

        updates.push({
          id: payload.communication_log_id,
          status: payload.status,
          vendor_message_id: payload.vendor_message_id
        });

        lastId = id;
      }

      if (updates.length) {
        const bulk = updates.map(u => ({
          updateOne: {
            filter: { _id: u.id },
            update: {
              $set: {
                status: u.status,
                vendor_message_id: u.vendor_message_id,
                last_updated: new Date()
              }
            }
          }
        }));

        await CommunicationLog.bulkWrite(bulk);
        console.log(`Processed ${updates.length} receipts`);
      }

      await setLastId(lastId);
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));

    } catch (err) {
      console.error('Receipt consumer error:', err);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

connectDB()
  .then(() => consumeReceipts())
  .catch(console.error);