import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { GetDashboardStatsQuery } from './get-dashboard-stats.query';
import {
  DASHBOARD_REPOSITORY,
  IDashboardRepository,
  DashboardStats,
} from '../../../../domain/stats/repositories/dashboard.repository.interface';

export type DashboardStatsResult = DashboardStats;

@Injectable()
@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler implements IQueryHandler<
  GetDashboardStatsQuery,
  DashboardStatsResult
> {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(query: GetDashboardStatsQuery): Promise<DashboardStatsResult> {
    return this.dashboardRepository.getDashboardStats(
      query.startDate,
      query.endDate,
    );
  }
}
