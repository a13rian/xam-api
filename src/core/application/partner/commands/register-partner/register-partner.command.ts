import { PartnerTypeEnum } from '../../../../domain/partner/value-objects/partner-type.vo';

export class RegisterPartnerCommand {
  constructor(
    public readonly userId: string,
    public readonly type: PartnerTypeEnum,
    public readonly description?: string,
    // Business-specific fields
    public readonly businessName?: string,
    public readonly taxId?: string,
    public readonly businessLicense?: string,
    public readonly companySize?: string,
    public readonly website?: string,
    public readonly socialMedia?: Record<string, string>,
    public readonly establishedDate?: Date,
    // Individual-specific fields
    public readonly displayName?: string,
    public readonly idCardNumber?: string,
    public readonly specialization?: string,
    public readonly yearsExperience?: number,
    public readonly certifications?: string[],
    public readonly portfolio?: string,
    public readonly personalBio?: string,
  ) {}
}
