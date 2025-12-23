import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAccountQuery } from './get-account.query';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import {
  IAccountGalleryRepository,
  ACCOUNT_GALLERY_REPOSITORY,
} from '../../../../domain/account/repositories/account-gallery.repository.interface';
import {
  IAccountServiceRepository,
  ACCOUNT_SERVICE_REPOSITORY,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';
import { OrganizationLocationOrmEntity } from '../../../../../infrastructure/persistence/typeorm/entities/organization-location.orm-entity';

export interface GalleryImageResult {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

export interface PriceRangeResult {
  min: number;
  max: number;
  currency: string;
}

export interface AccountServiceResult {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  durationMinutes: number;
  categoryId: string;
}

export interface GetAccountResult {
  id: string;
  displayName: string;
  type: string;
  status: string;
  // Profile fields
  avatarUrl: string | null;
  coverImageUrl: string | null;
  videoIntroUrl: string | null;
  tagline: string | null;
  personalBio: string | null;
  specialization: string | null;
  // Trust & rating
  isVerified: boolean;
  rating: number | null;
  totalReviews: number;
  completedBookings: number;
  badges: string[];
  // Additional info
  languages: string[];
  priceRange: PriceRangeResult | null;
  // Organization info (for booking)
  organizationId?: string | null;
  primaryLocationId?: string | null;
  // Galleries
  galleries: GalleryImageResult[];
  // Services
  services: AccountServiceResult[];
}

@QueryHandler(GetAccountQuery)
export class GetAccountHandler implements IQueryHandler<GetAccountQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(ACCOUNT_GALLERY_REPOSITORY)
    private readonly galleryRepository: IAccountGalleryRepository,
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
    @InjectRepository(OrganizationLocationOrmEntity)
    private readonly locationRepository: Repository<OrganizationLocationOrmEntity>,
  ) {}

  async execute(query: GetAccountQuery): Promise<GetAccountResult> {
    const account = await this.accountRepository.findById(query.accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Only return public info for active accounts
    if (account.statusValue !== 'active') {
      throw new NotFoundException('Account not found');
    }

    // Get gallery
    const galleryEntities = await this.galleryRepository.findByAccountId(
      account.id,
    );
    const gallery: GalleryImageResult[] = galleryEntities.map((g) => ({
      id: g.id,
      imageUrl: g.imageUrl,
      caption: g.caption,
      sortOrder: g.sortOrder,
    }));

    // Get organizationId and primaryLocationId
    const organizationId = account.organizationId ?? null;
    let primaryLocationId: string | null = null;

    if (organizationId) {
      const primaryLocation = await this.locationRepository.findOne({
        where: {
          organizationId,
          isPrimary: true,
          isActive: true,
        },
      });
      primaryLocationId = primaryLocation?.id ?? null;
    }

    // Get active services
    const serviceEntities = await this.accountServiceRepository.findByAccountId(
      account.id,
      true, // activeOnly
    );
    const services: AccountServiceResult[] = serviceEntities.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? null,
      price: s.price.amount,
      currency: s.price.currency,
      durationMinutes: s.durationMinutes,
      categoryId: s.categoryId,
    }));

    return {
      id: account.id,
      displayName: account.displayName,
      type: account.typeValue,
      status: account.statusValue,
      // Profile fields
      avatarUrl: account.avatarUrl,
      coverImageUrl: account.coverImageUrl,
      videoIntroUrl: account.videoIntroUrl,
      tagline: account.tagline,
      personalBio: account.personalBio,
      specialization: account.specialization,
      // Trust & rating
      isVerified: account.isVerified,
      rating: account.rating,
      totalReviews: account.totalReviews,
      completedBookings: account.completedBookings,
      badges: account.badges,
      // Additional info
      languages: account.languages,
      priceRange: account.priceRange
        ? {
            min: account.priceRange.min,
            max: account.priceRange.max,
            currency: account.priceRange.currency,
          }
        : null,
      // Organization info (for booking)
      organizationId,
      primaryLocationId,
      // Galleries
      galleries: gallery,
      // Services
      services,
    };
  }
}
