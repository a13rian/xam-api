import { AccountTypeEnum } from '../../../../core/domain/account/value-objects/account-type.vo';
import { AccountRoleEnum } from '../../../../core/domain/account/value-objects/account-role.vo';
import { AccountStatusEnum } from '../../../../core/domain/account/value-objects/account-status.vo';
import { SocialLinksData } from '../../../../core/domain/account/value-objects/social-links.vo';
import { ServiceAreaData } from '../../../../core/domain/account/value-objects/service-area.vo';
import { PriceRangeData } from '../../../../core/domain/account/value-objects/price-range.vo';
import { WorkingHoursData } from '../../../../core/domain/account/value-objects/working-hours.vo';

export class OrganizationSummaryDto {
  id: string;
  businessName: string;
  status: string;
  description: string | null;
  rating: number;
  reviewCount: number;
}

export class AccountGalleryResponseDto {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  createdAt: Date;
}

export class AccountResponseDto {
  id: string;
  userId: string;
  type: AccountTypeEnum;
  role: AccountRoleEnum | null;
  displayName: string;
  specialization: string | null;
  yearsExperience: number | null;
  certifications: string[];
  portfolio: string | null;
  personalBio: string | null;
  status: AccountStatusEnum;
  isActive: boolean;
  createdAt: Date;
  organization?: OrganizationSummaryDto;
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
  // Gallery (optional, loaded separately)
  gallery?: AccountGalleryResponseDto[];
}

export class RegisterAccountResponseDto {
  id: string;
  userId: string;
  type: string;
  displayName: string;
  status: string;
  organizationId?: string;
  businessName?: string;
}
