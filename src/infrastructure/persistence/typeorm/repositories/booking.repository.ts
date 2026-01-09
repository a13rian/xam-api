import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../../../core/domain/booking/entities/booking.entity';
import {
  IBookingRepository,
  BookingSearchOptions,
  BookingSearchResult,
  BookingStatsOptions,
  CustomerStatsResult,
  BookingsByStatusResult,
  ServiceUsageResult,
  MonthlyTrendResult,
} from '../../../../core/domain/booking/repositories/booking.repository.interface';
import { BookingStatusEnum } from '../../../../core/domain/booking/value-objects/booking-status.vo';
import { BookingOrmEntity } from '../entities/booking.orm-entity';
import { BookingMapper } from '../mappers/booking.mapper';

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly repository: Repository<BookingOrmEntity>,
    private readonly mapper: BookingMapper,
  ) {}

  async findById(id: string): Promise<Booking | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['services'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    const entities = await this.repository.find({
      where: { customerId },
      relations: ['services'],
      order: { scheduledDate: 'DESC', startTime: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByOrganizationId(organizationId: string): Promise<Booking[]> {
    const entities = await this.repository.find({
      where: { organizationId },
      relations: ['services'],
      order: { scheduledDate: 'DESC', startTime: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async search(options: BookingSearchOptions): Promise<BookingSearchResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const query = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.services', 'services');

    if (options.customerId) {
      query.andWhere('booking.customerId = :customerId', {
        customerId: options.customerId,
      });
    }

    if (options.organizationId) {
      query.andWhere('booking.organizationId = :organizationId', {
        organizationId: options.organizationId,
      });
    }

    if (options.accountId) {
      query.andWhere('booking.accountId = :accountId', {
        accountId: options.accountId,
      });
    }

    if (options.locationId) {
      query.andWhere('booking.locationId = :locationId', {
        locationId: options.locationId,
      });
    }

    if (options.status) {
      query.andWhere('booking.status = :status', { status: options.status });
    }

    if (options.startDate && options.endDate) {
      query.andWhere('booking.scheduledDate BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    } else if (options.startDate) {
      query.andWhere('booking.scheduledDate >= :startDate', {
        startDate: options.startDate,
      });
    } else if (options.endDate) {
      query.andWhere('booking.scheduledDate <= :endDate', {
        endDate: options.endDate,
      });
    }

    query
      .orderBy('booking.scheduledDate', 'DESC')
      .addOrderBy('booking.startTime', 'DESC');

    const [entities, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items: entities.map((e) => this.mapper.toDomain(e)),
      total,
      page,
      limit,
    };
  }

  async save(booking: Booking): Promise<void> {
    const ormEntity = this.mapper.toOrm(booking);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getCustomerStats(
    options: BookingStatsOptions,
  ): Promise<CustomerStatsResult> {
    const query = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.services', 'services')
      .where('booking.customerId = :customerId', {
        customerId: options.customerId,
      });

    if (options.startDate) {
      query.andWhere('booking.scheduledDate >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      query.andWhere('booking.scheduledDate <= :endDate', {
        endDate: options.endDate,
      });
    }

    const entities = await query
      .orderBy('booking.scheduledDate', 'DESC')
      .getMany();

    // Calculate totals
    const totalBookings = entities.length;
    let totalSpent = 0;
    const currency = 'VND';

    // Count by status
    const statusCounts = new Map<BookingStatusEnum, number>();
    Object.values(BookingStatusEnum).forEach((status) => {
      statusCounts.set(status, 0);
    });

    // Service usage tracking
    const serviceUsage = new Map<
      string,
      { serviceName: string; count: number; totalSpent: number }
    >();

    // Monthly trends
    const monthlyData = new Map<
      string,
      { bookingCount: number; totalSpent: number }
    >();

    for (const booking of entities) {
      // Total spent (only count completed bookings)
      if (booking.status === BookingStatusEnum.COMPLETED) {
        totalSpent += Number(booking.totalAmount);
      }

      // Status counts
      statusCounts.set(
        booking.status,
        (statusCounts.get(booking.status) || 0) + 1,
      );

      // Service usage
      for (const service of booking.services || []) {
        const serviceKey = service.serviceId || service.serviceName;
        const existing = serviceUsage.get(serviceKey);
        if (existing) {
          existing.count += 1;
          existing.totalSpent += Number(service.price);
        } else {
          serviceUsage.set(serviceKey, {
            serviceName: service.serviceName,
            count: 1,
            totalSpent: Number(service.price),
          });
        }
      }

      // Monthly trends
      const scheduledDate = new Date(booking.scheduledDate);
      const monthKey = `${scheduledDate.getFullYear()}-${String(scheduledDate.getMonth() + 1).padStart(2, '0')}`;
      const monthData = monthlyData.get(monthKey) || {
        bookingCount: 0,
        totalSpent: 0,
      };
      monthData.bookingCount += 1;
      if (booking.status === BookingStatusEnum.COMPLETED) {
        monthData.totalSpent += Number(booking.totalAmount);
      }
      monthlyData.set(monthKey, monthData);
    }

    // Convert to arrays
    const bookingsByStatus: BookingsByStatusResult[] = Array.from(
      statusCounts.entries(),
    )
      .map(([status, count]) => ({ status, count }))
      .filter((item) => item.count > 0);

    const topServices: ServiceUsageResult[] = Array.from(serviceUsage.entries())
      .map(([serviceId, data]) => ({
        serviceId,
        serviceName: data.serviceName,
        count: data.count,
        totalSpent: data.totalSpent,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const monthlyTrends: MonthlyTrendResult[] = Array.from(
      monthlyData.entries(),
    )
      .map(([month, data]) => ({
        month,
        bookingCount: data.bookingCount,
        totalSpent: data.totalSpent,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const completedCount = statusCounts.get(BookingStatusEnum.COMPLETED) || 0;
    const averageBookingValue =
      completedCount > 0 ? totalSpent / completedCount : 0;

    return {
      totalBookings,
      totalSpent,
      currency,
      bookingsByStatus,
      topServices,
      monthlyTrends,
      averageBookingValue,
    };
  }
}
