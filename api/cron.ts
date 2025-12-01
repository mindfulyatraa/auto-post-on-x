import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Twitter Client
const twitterClient = new TwitterApi({
    appKey: process.env.VITE_TWITTER_API_KEY!,
    appSecret: process.env.VITE_TWITTER_API_SECRET!,
    accessToken: process.env.VITE_TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.VITE_TWITTER_ACCESS_SECRET!,
});

export default async function handler(request: Request) {
    // Only allow POST requests (triggered by GitHub Actions or Vercel Cron)
    if (request.method !== 'POST' && request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        // 1. Fetch due tweets from Supabase
        const now = new Date().toISOString();
        const { data: dueTweets, error } = await supabase
            .from('tweets')
            .select('*')
            .eq('status', 'queued')
            .lte('scheduled_time', now);

        if (error) throw error;

        if (!dueTweets || dueTweets.length === 0) {
            return new Response(JSON.stringify({ message: 'No tweets to post' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const results = [];

        // 2. Post each tweet
        for (const tweet of dueTweets) {
            try {
                // Post to Twitter
                await twitterClient.v2.tweet(tweet.content);

                // Update status to posted
                await supabase
                    .from('tweets')
                    .update({ status: 'posted' })
                    .eq('id', tweet.id);

                results.push({ id: tweet.id, status: 'success' });
            } catch (postError) {
                console.error(`Failed to post tweet ${tweet.id}:`, postError);

                // Update status to failed
                await supabase
                    .from('tweets')
                    .update({ status: 'failed' })
                    .eq('id', tweet.id);

                results.push({ id: tweet.id, status: 'failed', error: postError });
            }
        }

        return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error('Cron job error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
