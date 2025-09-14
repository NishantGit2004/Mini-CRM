import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rules: { type: Object, required: true },
  preview_count: { type: Number, default: 0 },
  created_by: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Segment', segmentSchema);