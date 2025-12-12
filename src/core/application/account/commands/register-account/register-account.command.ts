import { AccountTypeEnum } from '../../../../domain/account/value-objects/account-type.vo';

export class RegisterAccountCommand {
  constructor(
    public readonly userId: string,
    public readonly type: AccountTypeEnum,
    public readonly displayName: string,
    // Individual fields
    public readonly specialization?: string,
    public readonly yearsExperience?: number,
    public readonly certifications?: string[],
    public readonly portfolio?: string,
    public readonly personalBio?: string,
    // Business fields (for creating organization)
    public readonly businessName?: string,
    public readonly description?: string,
    public readonly taxId?: string,
    public readonly businessLicense?: string,
    public readonly companySize?: string,
    public readonly website?: string,
    public readonly socialMedia?: Record<string, string>,
    public readonly establishedDate?: Date,
  ) {}
}
