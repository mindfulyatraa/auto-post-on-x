import { createClient } from '@supabase/supabase-js';

// These will be filled with your actual keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tweet = {
    id: string;
    content: string;
    scheduled_time: string;
    status: 'queued' | 'posted' | 'failed';
    created_at?: string;
};
