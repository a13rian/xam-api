export interface AdminUpdateAccountData {
  displayName?: string;
  specialization?: string;
  personalBio?: string;
  portfolio?: string;
  phone?: string;
  businessEmail?: string;
  website?: string;
  tagline?: string;
  isVerified?: boolean;
}

export class AdminUpdateAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly data: AdminUpdateAccountData,
    public readonly updatedBy: string,
  ) {}
}
