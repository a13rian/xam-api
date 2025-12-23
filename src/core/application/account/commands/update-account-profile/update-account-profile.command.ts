import { SocialLinksData } from '../../../../domain/account/value-objects/social-links.vo';
import { ServiceAreaData } from '../../../../domain/account/value-objects/service-area.vo';
import { PriceRangeData } from '../../../../domain/account/value-objects/price-range.vo';
import { WorkingHoursData } from '../../../../domain/account/value-objects/working-hours.vo';

export interface UpdateAccountProfileData {
  // Basic profile
  displayName?: string;
  specialization?: string;
  portfolio?: string;
  personalBio?: string;
  // Media
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  videoIntroUrl?: string | null;
  // Contact & Social
  phone?: string | null;
  businessEmail?: string | null;
  website?: string | null;
  socialLinks?: SocialLinksData | null;
  // Professional/Service
  tagline?: string | null;
  serviceAreas?: ServiceAreaData[];
  languages?: string[];
  workingHours?: WorkingHoursData | null;
  priceRange?: PriceRangeData | null;
}

export class UpdateAccountProfileCommand {
  constructor(
    public readonly accountId: string,
    public readonly data: UpdateAccountProfileData,
  ) {}
}
