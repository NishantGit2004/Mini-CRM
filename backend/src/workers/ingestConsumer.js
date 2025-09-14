import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

const redis = new Redis(process.env.REDIS_URL);

async function processMessages(streamKey, messages) {
  const docs = [];
  for(const [, fields] of messages) {
    const payloadStr = fields.payload;
    const data = JSON.parse(payloadStr).payload;
    if(streamKey === 'customers_ingest') {
      docs.push(data);
    } else if(streamKey === 'orders_ingest') {
      // insert orders and update customer aggregates
      await Order.updateOne({ order_id: data.order_id }, { $set: data }, { upsert: true });
      await Customer.updateOne(
        { customer_id: data.customer_id },
        {
          $inc: { total_spend: data.amount, visits: 1 },
          $set: { last_order_at: new Date() }
        },
        { upsert: true }
      );
    }
  }
  if(docs.length) {
    // bulk upsert customers by customer_id
    const ops = docs.map(d => ({
      updateOne: { filter: { customer_id: d.customer_id }, update: { $set: d }, upsert: true }
    }));
    await Customer.bulkWrite(ops);
  }
}

async function consumeStream(streamKey) {
  console.log('Starting ingest consumer for', streamKey);
  let lastId = '0-0';
  while(true) {
    try {
      // BLOCK for 5s, return up to 100
      const res = await redis.xread('BLOCK', 5000, 'COUNT', 100, 'STREAMS', streamKey, lastId);
      if(!res) continue;
      const [ , entries ] = res[0]; // [streamKey, [[id, {payload:...}], ...]]
      for(const msg of entries) {
        const [id, fields] = msg;
        await processMessages(streamKey, [[id, fields]]);
        lastId = id;
      }
    } catch(err) {
      console.error('Ingest consumer error', err);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function startConsumers() {
  consumeStream('customers_ingest');
  consumeStream('orders_ingest');
}

startConsumers().catch(console.error);