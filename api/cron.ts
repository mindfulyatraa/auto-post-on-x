import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';

// Initialize Supabase Client
const supabaseUrl = 'https://hcwmfrudhuubyiwyplik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjd21mcnVkaHV1Ynlpd3lwbGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE0MTksImV4cCI6MjA4MDE2NzQxOX0.hhwmpOVWM4pkaVpHvZgieY1YxSzv4JtICfXU5CVrEAE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Twitter Client
const twitterClient = new TwitterApi({
    appKey: 'j2whhxv3SVZkUmERGoc148yt5',
    appSecret: 'FeRKb7tVq6bNaXsZx77PoXurFNYToIWUggSYrijf0Hjgm3vcAZ',
    accessToken: '1995057623360761857-oCClWVYc92siHfdgymtargyAV0jl4V',
    accessSecret: 'Uv6Xxqp6N0PpahxkTJijgxEwJCzrlSsM3SvRImnNhozxI',
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

        // Helper: retry with exponential backoff
        async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    return await fn();
                } catch (error) {
                    if (attempt === maxRetries - 1) throw error;
                    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                    console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // 2. Post each tweet with retry logic
        for (const tweet of dueTweets) {
            try {
                // Add timestamp to content to ensure uniqueness (avoid duplicate errors)
                const uniqueContent = `${tweet.content}\n\n#${Date.now()}`.slice(0, 280);

                // Post to Twitter with retry
                await retryWithBackoff(async () => {
                    await twitterClient.v2.tweet(uniqueContent);
                });

                // Update status to posted
                await supabase
                    .from('tweets')
                    .update({ status: 'posted' })
                    .eq('id', tweet.id);

                results.push({ id: tweet.id, status: 'success' });
            } catch (postError) {
                console.error(`Failed to post tweet ${tweet.id} after retries:`, postError);

                // Update status to failed
                await supabase
                    .from('tweets')
                    .update({ status: 'failed' })
                    .eq('id', tweet.id);

                results.push({ id: tweet.id, status: 'failed', error: String(postError) });
            }
        }

        return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        console.error('Cron job error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
