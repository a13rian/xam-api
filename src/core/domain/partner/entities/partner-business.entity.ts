import { AggregateRoot } from '@nestjs/cqrs';

export interface PartnerBusinessProps {
  partnerId: string;
  businessName: string;
  taxId?: string | null;
  businessLicense?: string | null;
  companySize?: string | null;
  website?: string | null;
  socialMedia?: Record<string, string>;
  establishedDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePartnerBusinessProps {
  partnerId: string;
  businessName: string;
  taxId?: string;
  businessLicense?: string;
  companySize?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  establishedDate?: Date;
}

export class PartnerBusiness extends AggregateRoot {
  private readonly _partnerId: string;
  private _businessName: string;
  private _taxId: string | null;
  private _businessLicense: string | null;
  private _companySize: string | null;
  private _website: string | null;
  private _socialMedia: Record<string, string>;
  private _establishedDate: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PartnerBusinessProps) {
    super();
    this._partnerId = props.partnerId;
    this._businessName = props.businessName;
    this._taxId = props.taxId ?? null;
    this._businessLicense = props.businessLicense ?? null;
    this._companySize = props.companySize ?? null;
    this._website = props.website ?? null;
    this._socialMedia = props.socialMedia ?? {};
    this._establishedDate = props.establishedDate ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreatePartnerBusinessProps): PartnerBusiness {
    return new PartnerBusiness({
      partnerId: props.partnerId,
      businessName: props.businessName,
      taxId: props.taxId,
      businessLicense: props.businessLicense,
      companySize: props.companySize,
      website: props.website,
      socialMedia: props.socialMedia,
      establishedDate: props.establishedDate,
    });
  }

  public static reconstitute(props: PartnerBusinessProps): PartnerBusiness {
    return new PartnerBusiness(props);
  }

  public update(props: {
    businessName?: string;
    taxId?: string | null;
    businessLicense?: string | null;
    companySize?: string | null;
    website?: string | null;
    socialMedia?: Record<string, string>;
    establishedDate?: Date | null;
  }): void {
    if (props.businessName !== undefined) {
      this._businessName = props.businessName;
    }
    if (props.taxId !== undefined) {
      this._taxId = props.taxId;
    }
    if (props.businessLicense !== undefined) {
      this._businessLicense = props.businessLicense;
    }
    if (props.companySize !== undefined) {
      this._companySize = props.companySize;
    }
    if (props.website !== undefined) {
      this._website = props.website;
    }
    if (props.socialMedia !== undefined) {
      this._socialMedia = props.socialMedia;
    }
    if (props.establishedDate !== undefined) {
      this._establishedDate = props.establishedDate;
    }
    this._updatedAt = new Date();
  }

  get partnerId(): string {
    return this._partnerId;
  }

  get businessName(): string {
    return this._businessName;
  }

  get taxId(): string | null {
    return this._taxId;
  }

  get businessLicense(): string | null {
    return this._businessLicense;
  }

  get companySize(): string | null {
    return this._companySize;
  }

  get website(): string | null {
    return this._website;
  }

  get socialMedia(): Record<string, string> {
    return { ...this._socialMedia };
  }

  get establishedDate(): Date | null {
    return this._establishedDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
