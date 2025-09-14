import redis from '../config/redis-client.js';

export async function deliveryReceipt(req, res) {
  const { vendor_message_id, communication_log_id, status } = req.body;
  if(!vendor_message_id || !communication_log_id || !status) return res.status(400).json({ error: 'missing fields' });

  await redis.xadd('delivery_receipts', '*', 'payload', JSON.stringify({ vendor_message_id, communication_log_id, status }));
  return res.json({ accepted: true });
}