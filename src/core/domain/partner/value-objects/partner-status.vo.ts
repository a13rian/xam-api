import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export enum PartnerStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export class PartnerStatus {
  private readonly _value: PartnerStatusEnum;

  private constructor(value: PartnerStatusEnum) {
    this._value = value;
  }

  public static pending(): PartnerStatus {
    return new PartnerStatus(PartnerStatusEnum.PENDING);
  }

  public static active(): PartnerStatus {
    return new PartnerStatus(PartnerStatusEnum.ACTIVE);
  }

  public static suspended(): PartnerStatus {
    return new PartnerStatus(PartnerStatusEnum.SUSPENDED);
  }

  public static rejected(): PartnerStatus {
    return new PartnerStatus(PartnerStatusEnum.REJECTED);
  }

  public static fromString(value: string): PartnerStatus {
    const enumValue = Object.values(PartnerStatusEnum).find((v) => v === value);
    if (!enumValue) {
      throw new ValidationException(`Invalid partner status: ${value}`);
    }
    return new PartnerStatus(enumValue);
  }

  public isPending(): boolean {
    return this._value === PartnerStatusEnum.PENDING;
  }

  public isActive(): boolean {
    return this._value === PartnerStatusEnum.ACTIVE;
  }

  public isSuspended(): boolean {
    return this._value === PartnerStatusEnum.SUSPENDED;
  }

  public isRejected(): boolean {
    return this._value === PartnerStatusEnum.REJECTED;
  }

  public canOperate(): boolean {
    return this._value === PartnerStatusEnum.ACTIVE;
  }

  public canBeApproved(): boolean {
    return this._value === PartnerStatusEnum.PENDING;
  }

  public canBeSuspended(): boolean {
    return this._value === PartnerStatusEnum.ACTIVE;
  }

  public canBeReactivated(): boolean {
    return this._value === PartnerStatusEnum.SUSPENDED;
  }

  get value(): PartnerStatusEnum {
    return this._value;
  }

  equals(other: PartnerStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
