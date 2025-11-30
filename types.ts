export interface Tweet {
  id: string;
  content: string;
  scheduledTime: string; // ISO string
  status: 'queued' | 'posted' | 'failed';
  mediaUrl?: string;
  likes?: number;
  retweets?: number;
}

export interface BotConfig {
  twitterApiKey: string;
  twitterApiSecret: string;
  accessToken: string;
  accessSecret: string;
  scheduleTime: string; // HH:mm format (UTC)
  frequency: 'daily' | 'twice-daily';
  autoRetry: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface EngagementMetric {
  date: string;
  impressions: number;
  likes: number;
  retweets: number;
}
