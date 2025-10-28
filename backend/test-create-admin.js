// Script to create initial admin user
const axios = require('axios');

// Replace this with your actual Vercel deployment URL
const API_URL = process.env.VERCEL_URL || 'https://your-project-name.vercel.app';

const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'Admin@123'
};

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    console.log('URL:', `${API_URL}/api/auth/create-admin`);
    
    const response = await axios.post(`${API_URL}/api/auth/create-admin`, adminData);
    
    console.log('✅ Admin created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n📝 Login Credentials:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\n🔑 Token:', response.data.token);
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createAdmin();

