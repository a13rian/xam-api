import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { IPartnerStaffRepository } from '../../../../core/domain/partner/repositories/partner-staff.repository.interface';
import { PartnerStaff } from '../../../../core/domain/partner/entities/partner-staff.entity';
import { PartnerStaffOrmEntity } from '../entities/partner-staff.orm-entity';
import { PartnerStaffMapper } from '../mappers/partner-staff.mapper';

@Injectable()
export class PartnerStaffRepository implements IPartnerStaffRepository {
  constructor(
    @InjectRepository(PartnerStaffOrmEntity)
    private readonly repository: Repository<PartnerStaffOrmEntity>,
    private readonly mapper: PartnerStaffMapper,
  ) {}

  async findById(id: string): Promise<PartnerStaff | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findByInvitationToken(token: string): Promise<PartnerStaff | null> {
    const orm = await this.repository.findOne({
      where: { invitationToken: token },
    });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findByPartnerIdAndUserId(
    partnerId: string,
    userId: string,
  ): Promise<PartnerStaff | null> {
    const orm = await this.repository.findOne({
      where: { partnerId, userId },
    });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findByPartnerIdAndEmail(
    partnerId: string,
    email: string,
  ): Promise<PartnerStaff | null> {
    const orm = await this.repository.findOne({
      where: { partnerId, email },
    });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<PartnerStaff[]> {
    const orms = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findByPartnerId(partnerId: string): Promise<PartnerStaff[]> {
    const orms = await this.repository.find({
      where: { partnerId },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async findActiveByPartnerId(partnerId: string): Promise<PartnerStaff[]> {
    const orms = await this.repository.find({
      where: { partnerId, isActive: true },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.mapper.toDomain(orm));
  }

  async save(staff: PartnerStaff): Promise<void> {
    const orm = this.mapper.toOrmEntity(staff);
    await this.repository.save(orm);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
