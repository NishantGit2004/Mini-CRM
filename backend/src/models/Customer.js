import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customer_id: { type: String, unique: true, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, index: true },
  phone: { type: String },
  total_spend: { type: Number, default: 0 },
  last_order_at: { type: Date },
  visits: { type: Number, default: 0 },
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);