import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDashboardRepository,
  DashboardStats,
  DailyUserGrowth,
  DailyRevenue,
  DailyBookingStats,
  BookingsByStatus,
} from '../../../../core/domain/stats/repositories/dashboard.repository.interface';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { AccountOrmEntity } from '../entities/account.orm-entity';
import { BookingOrmEntity } from '../entities/booking.orm-entity';
import { WalletOrmEntity } from '../entities/wallet.orm-entity';
import { OrganizationOrmEntity } from '../entities/organization.orm-entity';
import { AccountTypeEnum } from '../../../../core/domain/account/value-objects/account-type.vo';
import { AccountStatusEnum } from '../../../../core/domain/account/value-objects/account-status.vo';
import { BookingStatusEnum } from '../../../../core/domain/booking/value-objects/booking-status.vo';

// Note: "Active companions" = INDIVIDUAL accounts that are ACTIVE
// This maps to service providers in the system

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(AccountOrmEntity)
    private readonly accountRepository: Repository<AccountOrmEntity>,
    @InjectRepository(BookingOrmEntity)
    private readonly bookingRepository: Repository<BookingOrmEntity>,
    @InjectRepository(WalletOrmEntity)
    private readonly walletRepository: Repository<WalletOrmEntity>,
    @InjectRepository(OrganizationOrmEntity)
    private readonly organizationRepository: Repository<OrganizationOrmEntity>,
  ) {}

  async getDashboardStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<DashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const effectiveStartDate = startDate || thirtyDaysAgo;
    const effectiveEndDate = endDate || now;

    const [
      totalUsers,
      totalAccounts,
      activeCompanions,
      pendingApprovals,
      totalBookings,
      totalRevenue,
      bookingsByStatus,
      userGrowth,
      revenueData,
      bookingData,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalAccounts(),
      this.getActiveCompanions(),
      this.getPendingApprovals(),
      this.getTotalBookings(),
      this.getTotalRevenue(),
      this.getBookingsByStatus(),
      this.getUserGrowth(effectiveStartDate, effectiveEndDate),
      this.getRevenueData(effectiveStartDate, effectiveEndDate),
      this.getBookingData(effectiveStartDate, effectiveEndDate),
    ]);

    return {
      totalUsers,
      totalAccounts,
      activeCompanions,
      pendingApprovals,
      totalBookings,
      totalRevenue,
      bookingsByStatus,
      userGrowth,
      revenueData,
      bookingData,
    };
  }

  private async getTotalUsers(): Promise<number> {
    return this.userRepository.count();
  }

  private async getTotalAccounts(): Promise<number> {
    return this.accountRepository.count();
  }

  private async getActiveCompanions(): Promise<number> {
    // Count INDIVIDUAL accounts that are ACTIVE (service providers)
    return this.accountRepository.count({
      where: {
        type: AccountTypeEnum.INDIVIDUAL,
        status: AccountStatusEnum.ACTIVE,
        isActive: true,
      },
    });
  }

  private async getPendingApprovals(): Promise<number> {
    return this.accountRepository.count({
      where: {
        status: AccountStatusEnum.PENDING,
      },
    });
  }

  private async getTotalBookings(): Promise<number> {
    return this.bookingRepository.count();
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('COALESCE(SUM(booking.totalAmount), 0)', 'total')
      .where('booking.status = :status', {
        status: BookingStatusEnum.COMPLETED,
      })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total || '0');
  }

  private async getBookingsByStatus(): Promise<BookingsByStatus> {
    const results = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('booking.status')
      .getRawMany<{ status: BookingStatusEnum; count: string }>();

    const statusMap: BookingsByStatus = {
      pending: 0,
      confirmed: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const row of results) {
      const count = parseInt(row.count, 10);
      switch (row.status) {
        case BookingStatusEnum.PENDING:
          statusMap.pending = count;
          break;
        case BookingStatusEnum.CONFIRMED:
          statusMap.confirmed = count;
          break;
        case BookingStatusEnum.IN_PROGRESS:
          statusMap.inProgress = count;
          break;
        case BookingStatusEnum.COMPLETED:
          statusMap.completed = count;
          break;
        case BookingStatusEnum.CANCELLED:
          statusMap.cancelled = count;
          break;
      }
    }

    return statusMap;
  }

  private async getUserGrowth(
    startDate: Date,
    endDate: Date,
  ): Promise<DailyUserGrowth[]> {
    const userResults = await this.userRepository
      .createQueryBuilder('user')
      .select("TO_CHAR(user.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :startDate', { startDate })
      .andWhere('user.createdAt <= :endDate', { endDate })
      .groupBy("TO_CHAR(user.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    const companionResults = await this.accountRepository
      .createQueryBuilder('account')
      .select("TO_CHAR(account.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('account.createdAt >= :startDate', { startDate })
      .andWhere('account.createdAt <= :endDate', { endDate })
      .andWhere('account.type = :type', { type: AccountTypeEnum.INDIVIDUAL })
      .groupBy("TO_CHAR(account.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    // Merge results by date
    const dateMap = new Map<string, DailyUserGrowth>();

    // Generate all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, { date: dateStr, users: 0, companions: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in user counts
    for (const row of userResults) {
      const existing = dateMap.get(row.date);
      if (existing) {
        existing.users = parseInt(row.count, 10);
      }
    }

    // Fill in companion counts
    for (const row of companionResults) {
      const existing = dateMap.get(row.date);
      if (existing) {
        existing.companions = parseInt(row.count, 10);
      }
    }

    return Array.from(dateMap.values());
  }

  private async getRevenueData(
    startDate: Date,
    endDate: Date,
  ): Promise<DailyRevenue[]> {
    const results = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("TO_CHAR(booking.completedAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COALESCE(SUM(booking.totalAmount), 0)', 'revenue')
      .where('booking.completedAt >= :startDate', { startDate })
      .andWhere('booking.completedAt <= :endDate', { endDate })
      .andWhere('booking.status = :status', {
        status: BookingStatusEnum.COMPLETED,
      })
      .groupBy("TO_CHAR(booking.completedAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; revenue: string }>();

    // Generate all dates in range
    const dateMap = new Map<string, DailyRevenue>();
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, { date: dateStr, revenue: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in revenue
    for (const row of results) {
      const existing = dateMap.get(row.date);
      if (existing) {
        existing.revenue = parseFloat(row.revenue);
      }
    }

    return Array.from(dateMap.values());
  }

  private async getBookingData(
    startDate: Date,
    endDate: Date,
  ): Promise<DailyBookingStats[]> {
    const results = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("TO_CHAR(booking.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('booking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('booking.createdAt >= :startDate', { startDate })
      .andWhere('booking.createdAt <= :endDate', { endDate })
      .groupBy("TO_CHAR(booking.createdAt, 'YYYY-MM-DD')")
      .addGroupBy('booking.status')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; status: BookingStatusEnum; count: string }>();

    // Generate all dates in range
    const dateMap = new Map<string, DailyBookingStats>();
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in booking counts
    for (const row of results) {
      const existing = dateMap.get(row.date);
      if (existing) {
        const count = parseInt(row.count, 10);
        switch (row.status) {
          case BookingStatusEnum.CONFIRMED:
            existing.confirmed = count;
            break;
          case BookingStatusEnum.IN_PROGRESS:
            existing.inProgress = count;
            break;
          case BookingStatusEnum.COMPLETED:
            existing.completed = count;
            break;
          case BookingStatusEnum.CANCELLED:
            existing.cancelled = count;
            break;
        }
      }
    }

    return Array.from(dateMap.values());
  }
}
