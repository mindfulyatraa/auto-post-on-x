import { createClient } from '@supabase/supabase-js';

// These will be filled with your actual keys
const supabaseUrl = 'https://hcwmfrudhuubyiwyplik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjd21mcnVkaHV1Ynlpd3lwbGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE0MTksImV4cCI6MjA4MDE2NzQxOX0.hhwmpOVWM4pkaVpHvZgieY1YxSzv4JtICfXU5CVrEAE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tweet = {
    id: string;
    content: string;
    scheduled_time: string;
    status: 'queued' | 'posted' | 'failed';
    created_at?: string;
};
