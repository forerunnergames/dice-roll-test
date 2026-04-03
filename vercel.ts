import { type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  crons: [{ path: '/api/cron/daily-close', schedule: '0 21 * * *' }],
};
