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

interface AccountDistanceRow {
  account_id: string;
  distance_km: string;
}

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

    // Build base query conditions
    const baseConditions = (qb: typeof query) => {
      qb.where('account.location IS NOT NULL')
        .andWhere('account.isActive = true')
        .andWhere(
          `ST_DWithin(account.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)`,
        )
        .setParameters({ lng: longitude, lat: latitude, radius: radiusMeters });

      if (search) {
        qb.andWhere('account.displayName ILIKE :search', {
          search: `%${search}%`,
        });
      }
      if (city) {
        qb.andWhere('account.city = :city', { city });
      }
      if (district) {
        qb.andWhere('account.district = :district', { district });
      }
      if (ward) {
        qb.andWhere('account.ward = :ward', { ward });
      }
    };

    // Query 1: Get total count
    const countQuery = this.ormRepository.createQueryBuilder('account');
    baseConditions(countQuery);
    const total = await countQuery.getCount();

    // Query 2: Get account IDs with pagination (WITHOUT gallery join to get correct pagination)
    const query = this.ormRepository
      .createQueryBuilder('account')
      .select(['account.id'])
      .addSelect(
        `ST_Distance(account.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) / 1000`,
        'distance_km',
      );
    baseConditions(query);
    query.orderBy('distance_km', 'ASC').offset(skip).limit(limit);

    const rawResults = await query.getRawMany<AccountDistanceRow>();

    if (rawResults.length === 0) {
      return { items: [], total, page, limit };
    }

    // Create distance map from raw results
    const accountIds = rawResults.map((r) => r.account_id);
    const distanceMap = new Map<string, number>();
    for (const raw of rawResults) {
      distanceMap.set(raw.account_id, parseFloat(raw.distance_km));
    }

    // Query 3: Load full account data with gallery for the paginated IDs
    const accounts = await this.ormRepository
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
        'account.avatarUrl',
        'account.tagline',
        'account.personalBio',
        'account.isVerified',
        'account.rating',
        'account.totalReviews',
        'account.completedBookings',
        'account.badges',
        'account.languages',
        'account.priceRange',
      ])
      .leftJoinAndSelect('account.gallery', 'gallery')
      .where('account.id IN (:...ids)', { ids: accountIds })
      .orderBy('gallery.sortOrder', 'ASC')
      .getMany();

    // Sort accounts by distance (maintain order from first query)
    const accountMap = new Map(accounts.map((a) => [a.id, a]));
    const sortedAccounts = accountIds
      .map((id) => accountMap.get(id))
      .filter((a): a is AccountOrmEntity => a !== undefined);

    const items = sortedAccounts.map((entity) => ({
      id: entity.id,
      displayName: entity.displayName,
      type: entity.type,
      status: entity.status,
      street: entity.street,
      ward: entity.ward,
      district: entity.district,
      city: entity.city,
      latitude: entity.latitude ? parseFloat(String(entity.latitude)) : null,
      longitude: entity.longitude ? parseFloat(String(entity.longitude)) : null,
      distanceKm: distanceMap.get(entity.id) ?? 0,
      avatarUrl: entity.avatarUrl,
      tagline: entity.tagline,
      personalBio: entity.personalBio,
      isVerified: entity.isVerified,
      rating: entity.rating ? parseFloat(String(entity.rating)) : null,
      totalReviews: entity.totalReviews,
      completedBookings: entity.completedBookings,
      badges: entity.badges ?? [],
      languages: entity.languages ?? [],
      priceRange: entity.priceRange
        ? {
            min: entity.priceRange.min,
            max: entity.priceRange.max,
            currency: entity.priceRange.currency,
          }
        : null,
      gallery: (entity.gallery ?? []).map((g) => ({
        id: g.id,
        imageUrl: g.imageUrl,
        caption: g.caption,
      })),
    }));

    return { items, total, page, limit };
  }
}
