import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema({
  campaign_id: { type: String, required: true, index: true },
  customer_id: { type: String, required: true, index: true },
  channel: { type: String, enum: ['sms','email'], required: true },
  vendor_message_id: { type: String },
  status: { type: String, enum: ['pending','sent','failed'], default: 'pending' },
  attempts: { type: Number, default: 0 }
}, { timestamps: { createdAt: true, updatedAt: 'last_updated' } });

export default mongoose.model('CommunicationLog', communicationLogSchema);