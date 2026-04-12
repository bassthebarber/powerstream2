import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: String,
  data: mongoose.Schema.Types.Mixed,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
}, { timestamps: true });
export default mongoose.model('Transaction', schema);
