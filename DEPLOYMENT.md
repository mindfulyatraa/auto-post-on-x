# Railway Deployment Guide

## Backend Deployment on Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"

### Step 2: Deploy from GitHub
1. Select "Deploy from GitHub repo"
2. Choose repository: `mindfulyatraa/auto-post-on-x`
3. Railway will auto-detect Node.js

### Step 3: Add Environment Variables
Go to your project → Variables tab and add:

```
VITE_TWITTER_API_KEY=j2whhxv3SVZkUmERGoc148yt5
VITE_TWITTER_API_SECRET=FeRKb7tVq6bNaXsZx77PoXurFNYToIWUggSYrijf0Hjgm3vcAZ
VITE_TWITTER_ACCESS_TOKEN=1995057623360761857-oCClWVYc92siHfdgymtargyAV0jl4V
VITE_TWITTER_ACCESS_SECRET=Uv6Xxqp6N0PpahxkTJijgxEwJCzrlSsM3SvRImnNhozxI
VITE_TWITTER_CLIENT_ID=akJBOVM2cE5sZlgwQU10TEg5LWg6MTpjaQ
VITE_TWITTER_CLIENT_SECRET=e1eSzOhe2xQRbSpWErtuQwHJc31ocEu6KDdgCi03COU02IVI7W
VITE_GEMINI_API_KEY=AIzaSyDyZ1llte7FEBz8Q0agpP6ol2B7M-AFVV0
PORT=3001
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Copy the Railway URL (e.g., `https://your-app.railway.app`)

---

## Frontend Deployment on Vercel

### Step 1: Update Frontend API URL
Before deploying to Vercel, update `App.tsx` to use Railway backend URL:

Replace all instances of `http://localhost:3001` with your Railway URL.

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `mindfulyatraa/auto-post-on-x`
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

### Step 3: Done!
Your app is now live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`

## Testing
1. Open Vercel URL
2. Go to Chat page
3. Create a challenge
4. Check Railway logs to see backend processing tweets
