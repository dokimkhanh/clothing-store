import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, trim: true },
  phone: { type: String, required: false, trim: true, default: null },
  fullname: { type: String, required: false, default: null },
  address: [{ street: String, city: String, state: String, zip: String, country: String }],
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'locked'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export default User;