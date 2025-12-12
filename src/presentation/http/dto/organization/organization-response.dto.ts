import { OrganizationStatusEnum } from '../../../../core/domain/organization/value-objects/organization-status.vo';

export class OrganizationResponseDto {
  id: string;
  businessName: string;
  status: OrganizationStatusEnum;
  description: string | null;
  rating: number;
  reviewCount: number;
  isHomeServiceEnabled: boolean;
  homeServiceRadiusKm: number | null;
  taxId: string | null;
  businessLicense: string | null;
  companySize: string | null;
  website: string | null;
  socialMedia: Record<string, string>;
  establishedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
