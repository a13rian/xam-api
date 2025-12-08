import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  And,
} from 'typeorm';
import {
  TimeSlot,
  TimeSlotStatus,
} from '../../../../core/domain/schedule/entities/time-slot.entity';
import { ITimeSlotRepository } from '../../../../core/domain/schedule/repositories/time-slot.repository.interface';
import { TimeSlotOrmEntity } from '../entities/time-slot.orm-entity';
import { TimeSlotMapper } from '../mappers/time-slot.mapper';

@Injectable()
export class TimeSlotRepository implements ITimeSlotRepository {
  constructor(
    @InjectRepository(TimeSlotOrmEntity)
    private readonly repository: Repository<TimeSlotOrmEntity>,
    private readonly mapper: TimeSlotMapper,
  ) {}

  async findById(id: string): Promise<TimeSlot | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByLocationIdAndDate(
    locationId: string,
    date: Date,
  ): Promise<TimeSlot[]> {
    const entities = await this.repository.find({
      where: { locationId, date },
      order: { startTime: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByLocationIdAndDateRange(
    locationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSlot[]> {
    const entities = await this.repository.find({
      where: {
        locationId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC', startTime: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findAvailableByLocationIdAndDate(
    locationId: string,
    date: Date,
  ): Promise<TimeSlot[]> {
    const entities = await this.repository.find({
      where: { locationId, date, status: TimeSlotStatus.AVAILABLE },
      order: { startTime: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByStaffIdAndDate(staffId: string, date: Date): Promise<TimeSlot[]> {
    const entities = await this.repository.find({
      where: { staffId, date },
      order: { startTime: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(slot: TimeSlot): Promise<void> {
    const ormEntity = this.mapper.toOrm(slot);
    await this.repository.save(ormEntity);
  }

  async saveMany(slots: TimeSlot[]): Promise<void> {
    const ormEntities = slots.map((s) => this.mapper.toOrm(s));
    await this.repository.save(ormEntities);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByLocationIdAndDateRange(
    locationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    await this.repository.delete({
      locationId,
      date: Between(startDate, endDate),
    });
  }

  async existsOverlapping(
    locationId: string,
    date: Date,
    startTime: string,
    endTime: string,
    staffId?: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('slot')
      .where('slot.locationId = :locationId', { locationId })
      .andWhere('slot.date = :date', { date })
      .andWhere('((slot.startTime < :endTime AND slot.endTime > :startTime))', {
        startTime,
        endTime,
      });

    if (staffId) {
      query.andWhere('slot.staffId = :staffId', { staffId });
    }

    if (excludeId) {
      query.andWhere('slot.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
