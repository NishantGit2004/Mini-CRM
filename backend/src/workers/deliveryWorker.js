import Redis from 'ioredis';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import CommunicationLog from '../models/CommunicationLog.js';
import Customer from '../models/Customer.js';
import { connectDB } from '../config/db.js';
await connectDB();

const redis = new Redis(process.env.REDIS_URL);
const VENDOR_URL = process.env.VENDOR_URL || 'http://localhost:5000/vendor/send';

async function processDelivery(payload) {
  // payload: { communication_log_id, customer_id }
  const { communication_log_id, customer_id } = payload;
  const customer = await Customer.findOne({ customer_id });
  const to = customer?.phone || customer?.email || 'unknown';
  const body = `Hi ${customer?.name || ''}, here's 10% off on your next order!`;

  try {
    await axios.post(VENDOR_URL, { to, body, communication_log_id });
    // vendor simulator will call delivery-receipt endpoint asynchronously
    await CommunicationLog.updateOne({ _id: communication_log_id }, { $inc: { attempts: 1 } });
  } catch (err) {
    console.error('delivery call failed', err);
    await CommunicationLog.updateOne({ _id: communication_log_id }, { $inc: { attempts: 1 } });
  }
}

async function consumeDeliveries() {
  console.log('delivery worker started');
  let lastId = '0-0';

  while (true) {
    try {
      const res = await redis.xread('BLOCK', 5000, 'COUNT', 10, 'STREAMS', 'deliveries', lastId);
      if (!res) continue;

      const [, entries] = res[0];

      for (const [id, fieldsArray] of entries) {
        // Convert Redis fields array to an object
        const fields = {};
        for (let i = 0; i < fieldsArray.length; i += 2) {
          fields[fieldsArray[i]] = fieldsArray[i + 1];
        }

        if (!fields.payload) {
          console.warn('Skipping entry with missing payload:', fieldsArray);
          lastId = id;
          continue;
        }

        let payload;
        try {
          payload = JSON.parse(fields.payload);
        } catch (err) {
          console.error('Failed to parse payload:', fields.payload, err);
          lastId = id;
          continue;
        }

        // Process delivery
        processDelivery(payload).catch(console.error);
        lastId = id;
      }
    } catch (err) {
      console.error('delivery worker error', err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

consumeDeliveries().catch(console.error);