export * from './get-dashboard-stats/get-dashboard-stats.query';
export * from './get-dashboard-stats/get-dashboard-stats.handler';
export * from './get-recent-activity/get-recent-activity.query';
export * from './get-recent-activity/get-recent-activity.handler';

import { GetDashboardStatsHandler } from './get-dashboard-stats/get-dashboard-stats.handler';
import { GetRecentActivityHandler } from './get-recent-activity/get-recent-activity.handler';

export const StatsQueryHandlers = [
  GetDashboardStatsHandler,
  GetRecentActivityHandler,
];
