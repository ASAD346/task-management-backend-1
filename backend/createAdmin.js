// Script to create initial admin user
// Run with: node createAdmin.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const createInitialAdmin = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/create-admin`, {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email:', response.data.user.email);
    console.log('Password: password123');
    console.log('\nToken:', response.data.token);
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

createInitialAdmin();
