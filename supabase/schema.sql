-- Create tweets table
create table public.tweets (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  scheduled_time timestamp with time zone not null,
  status text check (status in ('queued', 'posted', 'failed')) default 'queued',
  created_at timestamp with time zone default now(),
  likes integer default 0,
  retweets integer default 0
);

-- Enable Row Level Security (RLS)
alter table public.tweets enable row level security;

-- Create policy to allow anonymous access (for simplicity in this demo, ideally restrict to authenticated users)
create policy "Allow public access"
  on public.tweets
  for all
  using (true)
  with check (true);
