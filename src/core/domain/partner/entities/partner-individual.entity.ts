import { AggregateRoot } from '@nestjs/cqrs';

export interface PartnerIndividualProps {
  partnerId: string;
  displayName: string;
  idCardNumber?: string | null;
  specialization?: string | null;
  yearsExperience?: number | null;
  certifications?: string[];
  portfolio?: string | null;
  personalBio?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePartnerIndividualProps {
  partnerId: string;
  displayName: string;
  idCardNumber?: string;
  specialization?: string;
  yearsExperience?: number;
  certifications?: string[];
  portfolio?: string;
  personalBio?: string;
}

export class PartnerIndividual extends AggregateRoot {
  private readonly _partnerId: string;
  private _displayName: string;
  private _idCardNumber: string | null;
  private _specialization: string | null;
  private _yearsExperience: number | null;
  private _certifications: string[];
  private _portfolio: string | null;
  private _personalBio: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PartnerIndividualProps) {
    super();
    this._partnerId = props.partnerId;
    this._displayName = props.displayName;
    this._idCardNumber = props.idCardNumber ?? null;
    this._specialization = props.specialization ?? null;
    this._yearsExperience = props.yearsExperience ?? null;
    this._certifications = props.certifications ?? [];
    this._portfolio = props.portfolio ?? null;
    this._personalBio = props.personalBio ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreatePartnerIndividualProps): PartnerIndividual {
    return new PartnerIndividual({
      partnerId: props.partnerId,
      displayName: props.displayName,
      idCardNumber: props.idCardNumber,
      specialization: props.specialization,
      yearsExperience: props.yearsExperience,
      certifications: props.certifications,
      portfolio: props.portfolio,
      personalBio: props.personalBio,
    });
  }

  public static reconstitute(props: PartnerIndividualProps): PartnerIndividual {
    return new PartnerIndividual(props);
  }

  public update(props: {
    displayName?: string;
    idCardNumber?: string | null;
    specialization?: string | null;
    yearsExperience?: number | null;
    certifications?: string[];
    portfolio?: string | null;
    personalBio?: string | null;
  }): void {
    if (props.displayName !== undefined) {
      this._displayName = props.displayName;
    }
    if (props.idCardNumber !== undefined) {
      this._idCardNumber = props.idCardNumber;
    }
    if (props.specialization !== undefined) {
      this._specialization = props.specialization;
    }
    if (props.yearsExperience !== undefined) {
      this._yearsExperience = props.yearsExperience;
    }
    if (props.certifications !== undefined) {
      this._certifications = [...props.certifications];
    }
    if (props.portfolio !== undefined) {
      this._portfolio = props.portfolio;
    }
    if (props.personalBio !== undefined) {
      this._personalBio = props.personalBio;
    }
    this._updatedAt = new Date();
  }

  get partnerId(): string {
    return this._partnerId;
  }

  get displayName(): string {
    return this._displayName;
  }

  get idCardNumber(): string | null {
    return this._idCardNumber;
  }

  get specialization(): string | null {
    return this._specialization;
  }

  get yearsExperience(): number | null {
    return this._yearsExperience;
  }

  get certifications(): string[] {
    return [...this._certifications];
  }

  get portfolio(): string | null {
    return this._portfolio;
  }

  get personalBio(): string | null {
    return this._personalBio;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
