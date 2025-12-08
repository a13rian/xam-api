import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from '../../../../core/domain/booking/entities/booking.entity';
import {
  IBookingRepository,
  BookingSearchOptions,
  BookingSearchResult,
} from '../../../../core/domain/booking/repositories/booking.repository.interface';
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

  async findByPartnerId(partnerId: string): Promise<Booking[]> {
    const entities = await this.repository.find({
      where: { partnerId },
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

    if (options.partnerId) {
      query.andWhere('booking.partnerId = :partnerId', {
        partnerId: options.partnerId,
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
}
