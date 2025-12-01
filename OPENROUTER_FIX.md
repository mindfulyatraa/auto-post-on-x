# OpenRouter API Test & Fix Instructions

## Problem
The OpenRouter API key is not being read by the frontend, causing "Connection error" messages.

## Solution

### Step 1: Update .env.local File
Open `.env.local` file and add/update this line:

```
VITE_GEMINI_API_KEY=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
```

### Step 2: Restart Dev Server
1. Stop `npm run dev` (Ctrl+C)
2. Start again: `npm run dev`

### Step 3: Test Locally
1. Open http://localhost:3000
2. Go to Chat page
3. Type: "Write a tweet about Mars"
4. Should work now! ✅

### Step 4: Update Render Deployment
Once local test works, update Render:

1. Go to Render Dashboard → Frontend Service
2. **Environment** tab
3. Find `VITE_GEMINI_API_KEY`
4. Update value to:
   ```
   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
   ```
5. **Save**
6. **Manual Deploy** → **Deploy latest commit**

## Verification
After deployment, test on live URL:
- Open your Render frontend URL
- Chat page → "Write a tweet"
- Should get AI response ✅

## Troubleshooting
If still not working:
1. Check browser console (F12)
2. Type: `console.log(import.meta.env.VITE_GEMINI_API_KEY)`
3. Should show the API key (not undefined)
