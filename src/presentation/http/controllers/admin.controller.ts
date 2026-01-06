import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  GetDashboardStatsQuery,
  GetRecentActivityQuery,
} from '../../../core/application/stats/queries';
import {
  AdminDashboardStatsResponseDto,
  RecentActivityResponseDto,
} from '../dto/admin/admin-stats.dto';

@ApiTags('admin')
@Controller('admin/stats')
export class AdminStatsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('dashboard')
  @RequirePermissions(PERMISSIONS.USER.READ)
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Get comprehensive statistics for admin dashboard',
  })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AdminDashboardStatsResponseDto> {
    const query = new GetDashboardStatsQuery(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return this.queryBus.execute(query);
  }

  @Get('recent-activity')
  @RequirePermissions(PERMISSIONS.USER.READ)
  @ApiOperation({
    summary: 'Get recent activity',
    description: 'Get recent activity across users, accounts, and bookings',
  })
  @ApiQuery({ name: 'limit', required: false })
  async getRecentActivity(
    @Query('limit') limit?: string,
  ): Promise<RecentActivityResponseDto> {
    const query = new GetRecentActivityQuery(parseInt(limit || '10', 10));

    return this.queryBus.execute(query);
  }
}
