import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../backend/models/User.js'; // adjust path if needed

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Only GET allowed');

  const ADMIN = {
    name: 'Admin User',
    email: 'admin1@example.com',
    password: 'password123'
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    let user = await User.findOne({ email: ADMIN.email });
    if (user) {
      return res.status(200).send('Admin already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN.password, salt);

    user = await User.create({
      name: ADMIN.name,
      email: ADMIN.email,
      password: hashed,
      role: 'admin',
      isAdmin: true
    });

    res.status(200).send(`✅ Admin created: ${user.email}`);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  } finally {
    try { await mongoose.disconnect(); } catch (e) {}
  }
}
