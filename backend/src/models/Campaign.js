import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  campaign_id: { type: String, unique: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  segment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Segment" },
  message_template: String,
  channel: String,
  audience_size: Number,
  status: { type: String, enum: ["processing", "completed"], default: "processing" },
}, { timestamps: true });


export default mongoose.model('Campaign', campaignSchema);
