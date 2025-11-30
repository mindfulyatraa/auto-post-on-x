import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const app = express();
const PORT = 3001;
const QUEUE_FILE = join(__dirname, 'queue.json');

app.use(cors());
app.use(express.json());

// In-memory queue
let queue = [];

// Load queue from file on startup
const loadQueue = () => {
    try {
        if (fs.existsSync(QUEUE_FILE)) {
            const data = fs.readFileSync(QUEUE_FILE, 'utf8');
            queue = JSON.parse(data);
            console.log(`Loaded ${queue.length} tweets from queue.json`);
        }
    } catch (error) {
        console.error('Error loading queue:', error);
        queue = [];
    }
};

// Save queue to file
const saveQueue = () => {
    try {
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
    } catch (error) {
        console.error('Error saving queue:', error);
    }
};

// Initialize Twitter Client
const getTwitterClient = () => {
    const appKey = process.env.VITE_TWITTER_API_KEY;
    const appSecret = process.env.VITE_TWITTER_API_SECRET;
    const accessToken = process.env.VITE_TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.VITE_TWITTER_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        throw new Error('Missing Twitter API Credentials');
    }

    return new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
    });
};

// API Endpoints

// Get queue
app.get('/api/queue', (req, res) => {
    res.json(queue);
});

// Add to queue
app.post('/api/queue', (req, res) => {
    const { content, scheduledTime } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const newTweet = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content,
        scheduledTime: scheduledTime || new Date(Date.now() + 60000).toISOString(),
        status: 'queued',
        likes: 0,
        retweets: 0
    };

    queue.unshift(newTweet);
    saveQueue();

    res.json({ success: true, tweet: newTweet });
});

// Delete from queue
app.delete('/api/queue/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = queue.length;
    queue = queue.filter(t => t.id !== id);

    if (queue.length < initialLength) {
        saveQueue();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Tweet not found' });
    }
});

// Manual post endpoint (kept for compatibility)
app.post('/api/tweet', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Tweet content is required' });
        }

        console.log('Attempting to post tweet:', content);

        const client = getTwitterClient();
        const rwClient = client.readWrite;

        const result = await rwClient.v2.tweet(content);

        console.log('Tweet posted successfully:', result);
        res.json({ success: true, data: result });

    } catch (error) {
        console.error('Error posting tweet:', error);
        res.status(500).json({
            error: 'Failed to post tweet',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        queueSize: queue.length
    });
});

// Queue Processor - runs every 10 seconds
const processQueue = async () => {
    const now = new Date();
    const dueTweets = queue.filter(t => t.status === 'queued' && new Date(t.scheduledTime) <= now);

    if (dueTweets.length === 0) return;

    for (const tweet of dueTweets) {
        try {
            console.log(`[${new Date().toLocaleTimeString()}] Processing tweet ${tweet.id}: ${tweet.content.substring(0, 50)}...`);

            const client = getTwitterClient();
            const rwClient = client.readWrite;
            const result = await rwClient.v2.tweet(tweet.content);

            // Update status
            const tweetIndex = queue.findIndex(t => t.id === tweet.id);
            if (tweetIndex !== -1) {
                queue[tweetIndex].status = 'posted';
                saveQueue();
                console.log(`✓ Tweet ${tweet.id} posted successfully`);
            }
        } catch (error) {
            console.error(`✗ Error posting tweet ${tweet.id}:`, error);
            // Optionally mark as failed
            const tweetIndex = queue.findIndex(t => t.id === tweet.id);
            if (tweetIndex !== -1) {
                queue[tweetIndex].status = 'failed';
                saveQueue();
            }
        }
    }
};

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Space Runner Bot Server`);
    console.log(`Server running on http://localhost:${PORT}`);
    loadQueue();

    // Start queue processor
    setInterval(processQueue, 10000); // Check every 10 seconds
    console.log(`📡 Queue processor active (checking every 10s)\n`);
});
