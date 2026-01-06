import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetDashboardStatsQuery } from './get-dashboard-stats.query';

export interface DashboardStatsResult {
  totalUsers: number;
  totalAccounts: number;
  activeCompanions: number;
  pendingApprovals: number;
  totalBookings: number;
  totalRevenue: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  userGrowth: Array<{
    date: string;
    users: number;
    companions: number;
  }>;
  revenueData: Array<{
    date: string;
    revenue: number;
  }>;
  bookingData: Array<{
    date: string;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }>;
}

@Injectable()
@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler implements IQueryHandler<
  GetDashboardStatsQuery,
  DashboardStatsResult
> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(_query: GetDashboardStatsQuery): Promise<DashboardStatsResult> {
    return Promise.resolve({
      totalUsers: 0,
      totalAccounts: 0,
      activeCompanions: 0,
      pendingApprovals: 0,
      totalBookings: 0,
      totalRevenue: 0,
      bookingsByStatus: {
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      },
      userGrowth: [],
      revenueData: [],
      bookingData: [],
    });
  }
}
