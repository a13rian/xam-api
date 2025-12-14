import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IAccountRepository,
  AccountSearchOptions,
  AccountSearchResult,
} from '../../../../core/domain/account/repositories/account.repository.interface';
import { Account } from '../../../../core/domain/account/entities/account.entity';
import { AccountStatusEnum } from '../../../../core/domain/account/value-objects/account-status.vo';
import { AccountTypeEnum } from '../../../../core/domain/account/value-objects/account-type.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';
import { AccountOrmEntity } from '../entities/account.orm-entity';
import { AccountMapper } from '../mappers/account.mapper';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private readonly ormRepository: Repository<AccountOrmEntity>,
    private readonly mapper: AccountMapper,
  ) {}

  async findById(id: string): Promise<Account | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Account | null> {
    const entity = await this.ormRepository.findOne({
      where: { userId },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByInvitationToken(token: string): Promise<Account | null> {
    const entity = await this.ormRepository.findOne({
      where: { invitationToken: token },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByOrganizationId(
    organizationId: string,
    options?: PaginationOptions,
  ): Promise<Account[]> {
    const entities = await this.ormRepository.find({
      where: { organizationId },
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByOrganizationId(organizationId: string): Promise<number> {
    return this.ormRepository.count({ where: { organizationId } });
  }

  async findByOrganizationIdAndUserId(
    organizationId: string,
    userId: string,
  ): Promise<Account | null> {
    const entity = await this.ormRepository.findOne({
      where: { organizationId, userId },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByStatus(
    status: AccountStatusEnum,
    options?: PaginationOptions,
  ): Promise<Account[]> {
    const entities = await this.ormRepository.find({
      where: { status },
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByStatus(status: AccountStatusEnum): Promise<number> {
    return this.ormRepository.count({ where: { status } });
  }

  async findByType(
    type: AccountTypeEnum,
    options?: PaginationOptions,
  ): Promise<Account[]> {
    const entities = await this.ormRepository.find({
      where: { type },
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByType(type: AccountTypeEnum): Promise<number> {
    return this.ormRepository.count({ where: { type } });
  }

  async findAll(options?: PaginationOptions): Promise<Account[]> {
    const entities = await this.ormRepository.find({
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countAll(): Promise<number> {
    return this.ormRepository.count();
  }

  async save(account: Account): Promise<void> {
    const entity = this.mapper.toPersistence(account);
    await this.ormRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { userId },
    });
    return count > 0;
  }

  async existsByOrganizationIdAndEmail(
    organizationId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _email: string,
  ): Promise<boolean> {
    // This would require joining with users table
    // For now, we can check by organization and userId
    const count = await this.ormRepository.count({
      where: { organizationId },
    });
    return count > 0;
  }

  async searchByLocation(
    options: AccountSearchOptions,
  ): Promise<AccountSearchResult> {
    const {
      latitude,
      longitude,
      radiusKm,
      search,
      city,
      district,
      ward,
      page,
      limit,
    } = options;
    const skip = (page - 1) * limit;
    const radiusMeters = radiusKm * 1000;

    const query = this.ormRepository
      .createQueryBuilder('account')
      .select([
        'account.id',
        'account.displayName',
        'account.type',
        'account.status',
        'account.street',
        'account.ward',
        'account.district',
        'account.city',
        'account.latitude',
        'account.longitude',
      ])
      .addSelect(
        `ST_Distance(account.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) / 1000`,
        'distance_km',
      )
      .where('account.location IS NOT NULL')
      .andWhere('account.isActive = true')
      .andWhere(
        `ST_DWithin(account.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)`,
      )
      .setParameters({ lng: longitude, lat: latitude, radius: radiusMeters });

    // Optional filters
    if (search) {
      query.andWhere('account.displayName ILIKE :search', {
        search: `%${search}%`,
      });
    }
    if (city) {
      query.andWhere('account.city = :city', { city });
    }
    if (district) {
      query.andWhere('account.district = :district', { district });
    }
    if (ward) {
      query.andWhere('account.ward = :ward', { ward });
    }

    // Order by distance
    query.orderBy('distance_km', 'ASC');

    // Get total count (need separate query for count with spatial filter)
    const countQuery = this.ormRepository
      .createQueryBuilder('account')
      .where('account.location IS NOT NULL')
      .andWhere('account.isActive = true')
      .andWhere(
        `ST_DWithin(account.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)`,
      )
      .setParameters({ lng: longitude, lat: latitude, radius: radiusMeters });

    if (search) {
      countQuery.andWhere('account.displayName ILIKE :search', {
        search: `%${search}%`,
      });
    }
    if (city) {
      countQuery.andWhere('account.city = :city', { city });
    }
    if (district) {
      countQuery.andWhere('account.district = :district', { district });
    }
    if (ward) {
      countQuery.andWhere('account.ward = :ward', { ward });
    }

    const total = await countQuery.getCount();

    // Get paginated results
    const rawResults = await query.offset(skip).limit(limit).getRawMany<{
      account_id: string;
      account_displayName: string;
      account_type: string;
      account_status: string;
      account_street: string | null;
      account_ward: string | null;
      account_district: string | null;
      account_city: string | null;
      account_latitude: string | null;
      account_longitude: string | null;
      distance_km: string;
    }>();

    const items = rawResults.map((row) => ({
      id: row.account_id,
      displayName: row.account_displayName,
      type: row.account_type,
      status: row.account_status,
      street: row.account_street,
      ward: row.account_ward,
      district: row.account_district,
      city: row.account_city,
      latitude: row.account_latitude ? parseFloat(row.account_latitude) : null,
      longitude: row.account_longitude
        ? parseFloat(row.account_longitude)
        : null,
      distanceKm: parseFloat(row.distance_km),
    }));

    return { items, total, page, limit };
  }
}
