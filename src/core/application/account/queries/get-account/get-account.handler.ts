import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetAccountQuery } from './get-account.query';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import {
  IAccountGalleryRepository,
  ACCOUNT_GALLERY_REPOSITORY,
} from '../../../../domain/account/repositories/account-gallery.repository.interface';

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
  yearsExperience: number | null;
  certifications: string[];
  // Trust & rating
  isVerified: boolean;
  rating: number | null;
  totalReviews: number;
  completedBookings: number;
  badges: string[];
  // Additional info
  languages: string[];
  priceRange: PriceRangeResult | null;
  // Gallery
  gallery: GalleryImageResult[];
}

@QueryHandler(GetAccountQuery)
export class GetAccountHandler implements IQueryHandler<GetAccountQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(ACCOUNT_GALLERY_REPOSITORY)
    private readonly galleryRepository: IAccountGalleryRepository,
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
      yearsExperience: account.yearsExperience,
      certifications: account.certifications,
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
      // Gallery
      gallery,
    };
  }
}
