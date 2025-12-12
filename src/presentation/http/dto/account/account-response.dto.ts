import { AccountTypeEnum } from '../../../../core/domain/account/value-objects/account-type.vo';
import { AccountRoleEnum } from '../../../../core/domain/account/value-objects/account-role.vo';
import { AccountStatusEnum } from '../../../../core/domain/account/value-objects/account-status.vo';

export class OrganizationSummaryDto {
  id: string;
  businessName: string;
  status: string;
  description: string | null;
  rating: number;
  reviewCount: number;
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
