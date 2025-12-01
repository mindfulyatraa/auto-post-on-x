import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = 'https://hcwmfrudhuubyiwyplik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjd21mcnVkaHV1Ynlpd3lwbGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE0MTksImV4cCI6MjA4MDE2NzQxOX0.hhwmpOVWM4pkaVpHvZgieY1YxSzv4JtICfXU5CVrEAE';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request: Request) {
    const url = new URL(request.url);

    // GET: Fetch queue
    if (request.method === 'GET') {
        const { data, error } = await supabase
            .from('tweets')
            .select('*')
            .order('scheduled_time', { ascending: true });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // POST: Add to queue
    if (request.method === 'POST') {
        try {
            const body = await request.json();
            const { content, scheduledTime } = body;

            const { data, error } = await supabase
                .from('tweets')
                .insert([
                    {
                        content,
                        scheduled_time: scheduledTime,
                        status: 'queued',
                    },
                ])
                .select();

            if (error) throw error;

            return new Response(JSON.stringify(data), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
