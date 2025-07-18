import mongoose, { Schema } from 'mongoose';

const adminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'superAdmin'],
      default: 'admin',
    },
  },
  { timestamps: true }
);
export default mongoose.model('Admin', adminSchema);
