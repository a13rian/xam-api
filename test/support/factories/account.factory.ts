import { DatabaseHelper } from '../database/database.helper';
import { AccountOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/account.orm-entity';
import { AccountTypeEnum } from '../../../src/core/domain/account/value-objects/account-type.vo';
import { AccountStatusEnum } from '../../../src/core/domain/account/value-objects/account-status.vo';
import { SocialLinksData } from '../../../src/core/domain/account/value-objects/social-links.vo';
import { ServiceAreaData } from '../../../src/core/domain/account/value-objects/service-area.vo';
import { PriceRangeData } from '../../../src/core/domain/account/value-objects/price-range.vo';
import { WorkingHoursData } from '../../../src/core/domain/account/value-objects/working-hours.vo';
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
  userOptions?: CreateUserOptions;
  // Media fields
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  videoIntroUrl?: string | null;
  // Contact & Social fields
  phone?: string | null;
  businessEmail?: string | null;
  website?: string | null;
  socialLinks?: SocialLinksData | null;
  // Professional/Service fields
  tagline?: string | null;
  serviceAreas?: ServiceAreaData[];
  languages?: string[];
  workingHours?: WorkingHoursData | null;
  priceRange?: PriceRangeData | null;
  // Trust & Verification fields
  isVerified?: boolean;
  verifiedAt?: Date | null;
  badges?: string[];
  rating?: number | null;
  totalReviews?: number;
  completedBookings?: number;
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
  // Media fields
  avatarUrl: string | null;
  coverImageUrl: string | null;
  videoIntroUrl: string | null;
  // Contact & Social fields
  phone: string | null;
  businessEmail: string | null;
  website: string | null;
  socialLinks: SocialLinksData | null;
  // Professional/Service fields
  tagline: string | null;
  serviceAreas: ServiceAreaData[];
  languages: string[];
  workingHours: WorkingHoursData | null;
  priceRange: PriceRangeData | null;
  // Trust & Verification fields
  isVerified: boolean;
  verifiedAt: Date | null;
  badges: string[];
  rating: number | null;
  totalReviews: number;
  completedBookings: number;
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
      // Media fields
      avatarUrl: options.avatarUrl ?? null,
      coverImageUrl: options.coverImageUrl ?? null,
      videoIntroUrl: options.videoIntroUrl ?? null,
      // Contact & Social fields
      phone: options.phone ?? null,
      businessEmail: options.businessEmail ?? null,
      website: options.website ?? null,
      socialLinks: options.socialLinks ?? null,
      // Professional/Service fields
      tagline: options.tagline ?? null,
      serviceAreas: options.serviceAreas ?? [],
      languages: options.languages ?? [],
      workingHours: options.workingHours ?? null,
      priceRange: options.priceRange ?? null,
      // Trust & Verification fields
      isVerified: options.isVerified ?? false,
      verifiedAt: options.verifiedAt ?? null,
      badges: options.badges ?? [],
      rating: options.rating ?? null,
      totalReviews: options.totalReviews ?? 0,
      completedBookings: options.completedBookings ?? 0,
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
      // Media fields
      avatarUrl: account.avatarUrl,
      coverImageUrl: account.coverImageUrl,
      videoIntroUrl: account.videoIntroUrl,
      // Contact & Social fields
      phone: account.phone,
      businessEmail: account.businessEmail,
      website: account.website,
      socialLinks: account.socialLinks,
      // Professional/Service fields
      tagline: account.tagline,
      serviceAreas: account.serviceAreas,
      languages: account.languages,
      workingHours: account.workingHours,
      priceRange: account.priceRange,
      // Trust & Verification fields
      isVerified: account.isVerified,
      verifiedAt: account.verifiedAt,
      badges: account.badges,
      rating: account.rating,
      totalReviews: account.totalReviews,
      completedBookings: account.completedBookings,
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

  async createVerified(
    options: CreateAccountOptions = {},
  ): Promise<CreatedAccount> {
    return this.create({
      ...options,
      isVerified: true,
      verifiedAt: new Date(),
    });
  }

  async createWithProfile(
    options: CreateAccountOptions = {},
  ): Promise<CreatedAccount> {
    return this.create({
      avatarUrl: 'https://example.com/avatar.jpg',
      coverImageUrl: 'https://example.com/cover.jpg',
      phone: '0901234567',
      businessEmail: 'business@example.com',
      website: 'https://example.com',
      tagline: 'Professional services',
      languages: ['vi', 'en'],
      ...options,
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
