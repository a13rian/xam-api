import { Partner } from '../entities/partner.entity';
import { PartnerStatusEnum } from '../value-objects/partner-status.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';

export const PARTNER_REPOSITORY = Symbol('IPartnerRepository');

export interface IPartnerRepository {
  findById(id: string): Promise<Partner | null>;
  findByUserId(userId: string): Promise<Partner | null>;
  findByStatus(
    status: PartnerStatusEnum,
    options?: PaginationOptions,
  ): Promise<Partner[]>;
  countByStatus(status: PartnerStatusEnum): Promise<number>;
  findAll(options?: PaginationOptions): Promise<Partner[]>;
  countAll(): Promise<number>;
  save(partner: Partner): Promise<void>;
  delete(id: string): Promise<void>;
  exists(userId: string): Promise<boolean>;
}
