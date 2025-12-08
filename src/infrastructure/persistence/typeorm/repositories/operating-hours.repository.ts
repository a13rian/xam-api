import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OperatingHours,
  DayOfWeek,
} from '../../../../core/domain/location/entities/operating-hours.entity';
import { IOperatingHoursRepository } from '../../../../core/domain/location/repositories/operating-hours.repository.interface';
import { OperatingHoursOrmEntity } from '../entities/operating-hours.orm-entity';
import { OperatingHoursMapper } from '../mappers/operating-hours.mapper';

@Injectable()
export class OperatingHoursRepository implements IOperatingHoursRepository {
  constructor(
    @InjectRepository(OperatingHoursOrmEntity)
    private readonly repository: Repository<OperatingHoursOrmEntity>,
    private readonly mapper: OperatingHoursMapper,
  ) {}

  async findById(id: string): Promise<OperatingHours | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByLocationId(locationId: string): Promise<OperatingHours[]> {
    const entities = await this.repository.find({
      where: { locationId },
      order: { dayOfWeek: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByLocationIdAndDay(
    locationId: string,
    dayOfWeek: DayOfWeek,
  ): Promise<OperatingHours | null> {
    const entity = await this.repository.findOne({
      where: { locationId, dayOfWeek },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(hours: OperatingHours): Promise<void> {
    const ormEntity = this.mapper.toOrm(hours);
    await this.repository.save(ormEntity);
  }

  async saveMany(hours: OperatingHours[]): Promise<void> {
    const ormEntities = hours.map((h) => this.mapper.toOrm(h));
    await this.repository.save(ormEntities);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByLocationId(locationId: string): Promise<void> {
    await this.repository.delete({ locationId });
  }
}
