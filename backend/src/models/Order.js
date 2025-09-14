import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true, required: true, index: true },
  customer_id: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  items: [{ sku: String, qty: Number }]
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Order', orderSchema);