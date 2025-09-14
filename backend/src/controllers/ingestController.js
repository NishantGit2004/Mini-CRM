import redis from '../config/redis-client.js';
import { v4 as uuidv4 } from 'uuid';

export async function ingestCustomers(req, res) {
  const customers = Array.isArray(req.body) ? req.body : [req.body];
  if(!customers.length) return res.status(400).json({ error: 'empty payload' });

  const ingestId = 'ingest_' + uuidv4();
  for(const c of customers) {
    await redis.xadd('customers_ingest', '*', 'payload', JSON.stringify({ ingestId, payload: c }));
  }
  return res.status(202).json({ accepted: customers.length, ingestId });
}

export async function ingestOrders(req, res) {
  const orders = Array.isArray(req.body) ? req.body : [req.body];
  if(!orders.length) return res.status(400).json({ error: 'empty payload' });

  const ingestId = 'ingest_' + uuidv4();
  for(const o of orders) {
    await redis.xadd('orders_ingest', '*', 'payload', JSON.stringify({ ingestId, payload: o }));
  }
  return res.status(202).json({ accepted: orders.length, ingestId });
}