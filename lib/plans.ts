export const PLANS = [
  { slug: 'beginner', name: 'Beginner', fee: 2000, minTasks: 4, maxTasks: 6, accent: 'starter' },
  { slug: 'bronze', name: 'Bronze', fee: 3500, minTasks: 7, maxTasks: 10, accent: 'bronze' },
  { slug: 'diamond', name: 'Diamond', fee: 5000, minTasks: 13, maxTasks: 16, accent: 'diamond' },
  { slug: 'gold', name: 'Gold', fee: 9000, minTasks: 19, maxTasks: 23, accent: 'gold' },
  { slug: 'star-gold', name: '🌟 Gold', fee: 15000, minTasks: 25, maxTasks: 28, accent: 'star' },
  { slug: 'expert', name: 'Expert', fee: 25000, minTasks: 30, maxTasks: 35, accent: 'expert' }
] as const;

export type PlanSlug = typeof PLANS[number]['slug'];
export const naira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;
