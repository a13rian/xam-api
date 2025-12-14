import { DatabaseHelper } from '../database/database.helper';
import { AccountOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/account.orm-entity';
import { AccountTypeEnum } from '../../../src/core/domain/account/value-objects/account-type.vo';
import { AccountStatusEnum } from '../../../src/core/domain/account/value-objects/account-status.vo';
import { UserFactory, CreateUserOptions, CreatedUser } from './user.factory';

export interface CreateAccountOptions {
  userId?: string;
  organizationId?: string | null;
  type?: AccountTypeEnum;
  displayName?: string;
  status?: AccountStatusEnum;
  isActive?: boolean;
  street?: string | null;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  specialization?: string | null;
  yearsExperience?: number | null;
  certifications?: string[];
  userOptions?: CreateUserOptions;
}

export interface CreatedAccount {
  id: string;
  userId: string;
  organizationId: string | null;
  type: AccountTypeEnum;
  displayName: string;
  status: AccountStatusEnum;
  isActive: boolean;
  street: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  user: CreatedUser;
}

let accountCounter = 0;

export class AccountFactory {
  private userFactory: UserFactory;

  constructor(private readonly db: DatabaseHelper) {
    this.userFactory = new UserFactory(db);
  }

  async create(options: CreateAccountOptions = {}): Promise<CreatedAccount> {
    accountCounter++;
    const accountRepo = this.db.getRepository(AccountOrmEntity);

    // Create user if not provided
    const user = options.userId
      ? ({ id: options.userId } as CreatedUser)
      : await this.userFactory.create(options.userOptions);

    const latitude = options.latitude ?? null;
    const longitude = options.longitude ?? null;

    const account = accountRepo.create({
      id: this.generateAccountId(),
      userId: options.userId ?? user.id,
      organizationId: options.organizationId ?? null,
      type: options.type ?? AccountTypeEnum.INDIVIDUAL,
      displayName: options.displayName ?? `Account ${accountCounter}`,
      status: options.status ?? AccountStatusEnum.ACTIVE,
      isActive: options.isActive ?? true,
      street: options.street ?? null,
      ward: options.ward ?? null,
      district: options.district ?? null,
      city: options.city ?? null,
      latitude,
      longitude,
      specialization: options.specialization ?? null,
      yearsExperience: options.yearsExperience ?? null,
      certifications: options.certifications ?? [],
    });

    // Set location as GeoJSON object for PostGIS if coordinates provided
    if (latitude !== null && longitude !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (account as any).location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    await accountRepo.save(account);

    return {
      id: account.id,
      userId: account.userId,
      organizationId: account.organizationId,
      type: account.type,
      displayName: account.displayName,
      status: account.status,
      isActive: account.isActive,
      street: account.street,
      ward: account.ward,
      district: account.district,
      city: account.city,
      latitude: account.latitude,
      longitude: account.longitude,
      user,
    };
  }

  async createWithLocation(
    latitude: number,
    longitude: number,
    options: CreateAccountOptions = {},
  ): Promise<CreatedAccount> {
    return this.create({
      ...options,
      latitude,
      longitude,
    });
  }

  async createBusiness(
    options: CreateAccountOptions = {},
  ): Promise<CreatedAccount> {
    return this.create({
      ...options,
      type: AccountTypeEnum.BUSINESS,
    });
  }

  async createInactive(
    options: CreateAccountOptions = {},
  ): Promise<CreatedAccount> {
    return this.create({
      ...options,
      isActive: false,
    });
  }

  async createPending(
    options: CreateAccountOptions = {},
  ): Promise<CreatedAccount> {
    return this.create({
      ...options,
      status: AccountStatusEnum.PENDING,
    });
  }

  private generateAccountId(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = 'acc_';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
