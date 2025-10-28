// Script to create initial admin user
// Run with: node createAdmin.js

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const API_URL = process.env.API_URL;
const MONGODB_URI = process.env.MONGODB_URI || null;

const ADMIN = {
  name: 'Admin User',
  email: 'admin1@example.com',
  password: 'password123'
};

const createViaApi = async () => {
  const response = await axios.post(`${API_URL}/auth/create-admin`, {
    name: ADMIN.name,
    email: ADMIN.email,
    password: ADMIN.password
  }, { timeout: 5000 });
  return { via: 'api', response: response.data };
};

const createDirectDb = async () => {
  if (!MONGODB_URI) throw new Error('MONGODB_URI not set in environment');

  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Adjust this path if your User model is located elsewhere
  const User = require('./models/User');

  let user = await User.findOne({ email: ADMIN.email });
  if (user) {
    return { via: 'db', message: 'Admin user already exists', user };
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(ADMIN.password, salt);

  const payload = {
    name: ADMIN.name,
    email: ADMIN.email,
    password: hashed,
    role: 'admin',     // common field name; your schema might use isAdmin instead
    isAdmin: true
  };

  user = await User.create(payload);

  // Optionally create a token if JWT_SECRET is present
  let token = null;
  if (process.env.JWT_SECRET) {
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
  }

  return { via: 'db', user, token };
};

const createInitialAdmin = async () => {
  try {
    try {
      const result = await createViaApi();
      console.log('✅ Admin created via API');
      console.log('Email:', ADMIN.email);
      console.log('Password:', ADMIN.password);
      if (result.response && result.response.token) console.log('Token:', result.response.token);
      return;
    } catch (apiErr) {
      console.warn('⚠️  API unavailable or returned error, falling back to direct DB. Error:', apiErr.message);
    }

    const dbResult = await createDirectDb();
    console.log('✅ Admin created via DB:', dbResult.message || 'created');
    console.log('Email:', ADMIN.email);
    console.log('Password:', ADMIN.password);
    if (dbResult.token) console.log('Token:', dbResult.token);
    else console.log('Note: JWT_SECRET not set; no token generated.');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  } finally {
    try { await mongoose.disconnect(); } catch (e) {}
  }
};

createInitialAdmin();
