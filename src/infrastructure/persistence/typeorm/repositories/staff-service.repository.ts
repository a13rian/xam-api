import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStaffServiceRepository } from '../../../../core/domain/service/repositories/staff-service.repository.interface';
import { StaffService } from '../../../../core/domain/service/entities/staff-service.entity';
import { StaffServiceOrmEntity } from '../entities/staff-service.orm-entity';
import { StaffServiceMapper } from '../mappers/staff-service.mapper';

@Injectable()
export class StaffServiceRepository implements IStaffServiceRepository {
  constructor(
    @InjectRepository(StaffServiceOrmEntity)
    private readonly repository: Repository<StaffServiceOrmEntity>,
    private readonly mapper: StaffServiceMapper,
  ) {}

  async findById(id: string): Promise<StaffService | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findByStaffId(staffId: string): Promise<StaffService[]> {
    const orms = await this.repository.find({
      where: { staffId },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findByServiceId(serviceId: string): Promise<StaffService[]> {
    const orms = await this.repository.find({
      where: { serviceId },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findByStaffIdAndServiceId(
    staffId: string,
    serviceId: string,
  ): Promise<StaffService | null> {
    const orm = await this.repository.findOne({
      where: { staffId, serviceId },
    });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async save(staffService: StaffService): Promise<void> {
    const orm = this.mapper.toOrmEntity(staffService);
    await this.repository.save(orm);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByStaffIdAndServiceId(
    staffId: string,
    serviceId: string,
  ): Promise<void> {
    await this.repository.delete({ staffId, serviceId });
  }
}
