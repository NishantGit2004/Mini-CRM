import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Customer from '../src/models/Customer.js';
import Order from '../src/models/Order.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB });
  console.log('connected to mongo for seed');

  const customers = [];
  for(let i=1;i<=2000;i++){
    customers.push({
      customer_id: `c_${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      phone: `+9112345${('000'+i).slice(-4)}`,
      total_spend: Math.floor(Math.random()*20000),
      last_order_at: new Date(Date.now() - Math.floor(Math.random()*365)*24*3600*1000),
      visits: Math.floor(Math.random()*10),
      tags: Math.random() > 0.8 ? ['vip'] : []
    });
  }
  await Customer.deleteMany({});
  await Customer.insertMany(customers);
  console.log('seeded customers');

  // optional orders
  const orders = [];
  for(let i=1;i<=1000;i++){
    const cid = `c_${Math.ceil(Math.random()*2000)}`;
    orders.push({
      order_id: `o_${i}`,
      customer_id: cid,
      amount: Math.floor(Math.random()*5000),
      items: [{ sku: 'p1', qty: 1 }]
    });
  }
  await Order.deleteMany({});
  await Order.insertMany(orders);
  console.log('seeded orders');

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });