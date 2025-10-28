# Netlify Deployment Guide for Frontend

This guide will help you deploy your frontend to Netlify.

## 📋 Prerequisites

- Frontend code ready (React, Vue, Angular, or plain HTML/CSS/JS)
- Netlify account (free at [netlify.com](https://netlify.com))
- GitHub account (recommended)

## 🚀 Deployment Methods

### **Method 1: Drag & Drop (Simplest)**

1. **Build your frontend** (if using React/Vue/etc):
   ```bash
   npm run build
   ```
   This creates a `dist` or `build` folder

2. **Go to [netlify.com](https://netlify.com)** and login

3. **Drag and drop** your build folder onto the Netlify dashboard

4. **Done!** Your site is live

### **Method 2: GitHub Integration (Best for CI/CD)**

1. **Push your frontend code to GitHub**

2. **Go to Netlify Dashboard** → Click "Add new site" → "Import an existing project"

3. **Connect to GitHub** and select your frontend repository

4. **Configure Build Settings:**
   - **Base directory:** (if frontend is in a subfolder, e.g., `frontend`)
   - **Build command:** 
     - React: `npm run build`
     - Vue: `npm run build`
     - Angular: `ng build`
     - Plain HTML: Leave empty
   - **Publish directory:** 
     - React: `build`
     - Vue: `dist`
     - Angular: `dist/<project-name>`
     - Plain HTML: `.` (root)

5. **Click "Deploy site"**

## ⚙️ Configure API Connection

After deploying, configure your frontend to connect to the Vercel backend:

### **For React/Vue/Angular:**

Create an `.env` file in your frontend root:

```env
VITE_API_URL=https://task-management-backend-1-tau.vercel.app
```

Or for Create React App:
```env
REACT_APP_API_URL=https://task-management-backend-1-tau.vercel.app
```

### **Add Environment Variable in Netlify:**

1. Go to **Site settings** → **Environment variables**
2. Click **Add variable**
3. Add:
   - **Key:** `VITE_API_URL` (or `REACT_APP_API_URL`)
   - **Value:** `https://task-management-backend-1-tau.vercel.app`
4. Save and **Redeploy**

## 🔧 API Integration Example

In your frontend code, create an API service file:

**JavaScript (fetch):**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://task-management-backend-1-tau.vercel.app';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

**With Axios:**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://task-management-back.fire.app';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 📱 Update Your Frontend Code

Replace all localhost API calls with environment variable:

**Before:**
```javascript
fetch('http://localhost:5000/api/auth/login', ...)
```

**After:**
```javascript
fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, ...)
```

## ✅ Final Steps

1. ✅ Deploy to Netlify
2. ✅ Add environment variable for API URL
3. ✅ Redeploy site
4. ✅ Test your frontend
5. ✅ Share the Netlify URL!

## 🌐 Your URLs

- **Backend API:** https://task-management-backend-1-tau.vercel.app
- **Frontend:** Will be provided after Netlify deployment
- **Default Netlify URL format:** `your-site-name.netlify.app`

## 🔐 Important Notes

- Store JWT tokens in localStorage or httpOnly cookies
- Always use environment variables for API URLs
- Enable CORS on backend (already done)
- Use HTTPS in production (Netlify provides this automatically)

## 🆘 Troubleshooting

**Issue:** CORS errors
- **Solution:** Backend already has CORS enabled, but ensure you're using the correct API URL

**Issue:** 404 errors on routes (React Router)
- **Solution:** Add `_redirects` file in public folder:
  ```
  /*    /index.html   200
  ```

**Issue:** Build fails
- **Solution:** Check build logs in Netlify dashboard for specific errors

**Issue:** Environment variables not working
- **Solution:** Variable names must match exactly (case-sensitive), then redeploy

## 📞 Need Help?

Share your frontend code location and I can help you integrate the API endpoints!

