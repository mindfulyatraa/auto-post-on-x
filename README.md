# 🚀 X-Bot Auto Post - Space Runner Edition

An intelligent Twitter bot with AI-powered content generation and automated scheduling. Perfect for managing long-term posting campaigns with 30-day challenges.

## ✨ Features

- **🤖 AI-Powered Content Generation**: Uses Google Gemini AI to create engaging tweets
- **📅 30-Day Challenge Mode**: Schedule entire campaigns (e.g., 60 tweets for 30 days × 2/day)
- **⏰ Smart Scheduling**: Morning (9 AM) and Night (8 PM) slots
- **💾 Backend Queue Management**: True background posting - close browser, tweets still post
- **🔄 Auto-Retry**: Automatic retry on failures
- **📊 Real-time Dashboard**: Monitor queue status and posting metrics
- **🎨 Beautiful UI**: Futuristic sci-fi themed interface

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **AI**: Google Gemini API
- **Twitter API**: twitter-api-v2
- **Styling**: CSS with custom design system

## 📋 Prerequisites

- Node.js (v16 or higher)
- Twitter Developer Account with API credentials
- Google Gemini API key

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd x-bot-for-auto-post
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# X (Twitter) API Credentials (OAuth 1.0a)
VITE_TWITTER_API_KEY=your_api_key
VITE_TWITTER_API_SECRET=your_api_secret
VITE_TWITTER_ACCESS_TOKEN=your_access_token
VITE_TWITTER_ACCESS_SECRET=your_access_secret

# X (Twitter) OAuth 2.0 Credentials (Optional)
VITE_TWITTER_CLIENT_ID=your_client_id
VITE_TWITTER_CLIENT_SECRET=your_client_secret

# Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

### 4. Run the Application

You need **two terminal windows**:

**Terminal 1 - Backend Server (MUST stay open for auto-posting):**
\`\`\`bash
npm run server
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating a 30-Day Challenge

1. Navigate to **AI Assistant** (Chat page)
2. Send a message like:
   \`\`\`
   Create a 30 day challenge, 2 posts per day
   \`\`\`
3. Review the generated tweets in the modal
4. Click **"Approve & Schedule All"**
5. Done! The backend will handle posting automatically

### Scheduling Individual Tweets

1. Ask the AI to generate a tweet
2. Click **"Schedule Tweet"** button
3. The tweet will be added to the queue

### Monitoring Queue

- Navigate to **Tweet Queue** page
- View all scheduled tweets with status:
  - 🟡 **Queued**: Waiting for scheduled time
  - 🟢 **Posted**: Successfully posted
  - 🔴 **Failed**: Error occurred

## 🏗️ Architecture

\`\`\`
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │   server.js  │ ◄─────► │ queue.json  │
│  (Frontend) │  HTTP   │   (Backend)  │  File   │ (Persist)   │
└─────────────┘         └──────┬───────┘         └─────────────┘
                               │
                               │ Every 10s
                               ▼
                        ┌──────────────┐
                        │ Twitter API  │
                        │  (Post Tweet)│
                        └──────────────┘
\`\`\`

## 📁 Project Structure

\`\`\`
x-bot-for-auto-post/
├── components/          # React components
│   └── Sidebar.tsx
├── pages/              # Page components
│   ├── Chat.tsx        # AI Assistant
│   ├── Dashboard.tsx   # Mission Control
│   ├── Queue.tsx       # Tweet Queue
│   └── Settings.tsx    # Configuration
├── services/           # API services
│   └── geminiService.ts
├── server.js           # Backend server
├── App.tsx             # Main app component
├── index.css           # Global styles
└── queue.json          # Persisted queue (auto-generated)
\`\`\`

## 🔒 Security

- **Never commit** \`.env.local\` or \`queue.json\` to version control
- API keys are gitignored by default
- Keep your \`npm run server\` terminal secure

## 🐛 Troubleshooting

**Tweets not posting?**
- Ensure \`npm run server\` is running
- Check API credentials in \`.env.local\`
- Verify scheduled time is in the future
- Check server logs for errors

**Challenge modal not appearing?**
- Use clear instructions: "X days, Y posts per day"
- Mention the word "challenge" in your request
- Check browser console for errors

## 📝 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 🙏 Acknowledgments

- Built with Google Gemini AI
- Powered by Twitter API v2
- Inspired by Space Runner aesthetics

---

Made with 💙 for automated social media management
\`\`\`
