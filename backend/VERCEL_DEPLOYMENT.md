# Vercel Deployment Guide

This guide will help you deploy your Task Management Backend to Vercel.

## Prerequisites

1. MongoDB Atlas account with a cluster created
2. Vercel account
3. GitHub account (recommended for easier deployment)

## Step 1: Prepare Your MongoDB Connection

1. Go to MongoDB Atlas and click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority`)
4. Replace `<password>` with your actual database password
5. Optionally update the database name (currently `taskmanagement`)

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

### Option B: Using GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure the project:
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: Leave empty
   - Output Directory: Leave empty

## Step 3: Add Environment Variables

After deploying, you need to add environment variables in Vercel:

1. Go to your project on Vercel dashboard
2. Click on "Settings" → "Environment Variables"
3. Add the following variables:

### Required Variables:

- **MONGODB_URI**: Your MongoDB Atlas connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority`

- **JWT_SECRET**: A secret key for JWT tokens
  - Generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Or use any random string

4. After adding variables, redeploy your application:
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"

## Step 4: Verify Deployment

1. Once deployed, Vercel will give you a URL like: `https://your-project.vercel.app`
2. Test the health endpoint: `https://your-project.vercel.app/`
3. You should see: `{"message":"Task Management API is running"}`

## Step 5: Create Initial Admin User

After deployment, you need to create an initial admin user:

1. Make a POST request to: `https://your-project.vercel.app/api/auth/create-admin`
2. Request body:
   ```json
   {
     "email": "admin@example.com",
     "password": "your-secure-password",
     "name": "Admin User"
   }
   ```

You can use tools like:
- Postman
- cURL
- Your frontend application

## API Endpoints

Once deployed, your API will be available at:
- Health Check: `GET https://your-project.vercel.app/`
- Login: `POST https://your-project.vercel.app/api/auth/login`
- Get Current User: `GET https://your-project.vercel.app/api/auth/me`
- Create Admin: `POST https://your-project.vercel.app/api/auth/create-admin`

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
- **Solution**: Check that MONGODB_URI is set correctly in Vercel environment variables
- Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs) for Vercel

### Issue: "Module not found" errors
- **Solution**: Make sure all dependencies are in `package.json` and not in `devDependencies`
- Redeploy after checking

### Issue: "Functions timed out"
- **Solution**: MongoDB connection might be slow. Check your cluster status in Atlas

### Issue: Routes not working
- **Solution**: Make sure you're using the correct base URL with `/api` prefix for API routes

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| JWT_SECRET | Secret key for JWT | `your-random-secret-key` |
| PORT | Server port (auto-set by Vercel) | `5000` |

## Notes

- Vercel automatically handles HTTPS and provides a free SSL certificate
- Your backend will be accessible globally via Vercel's CDN
- Functions have a timeout limit (10 seconds on free tier, 60 seconds on Pro)
- Database connections are reused across function invocations for better performance


