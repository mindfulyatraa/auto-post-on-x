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
