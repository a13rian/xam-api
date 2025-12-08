export enum InvitationStatusEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export class InvitationStatus {
  private constructor(private readonly _value: InvitationStatusEnum) {}

  static pending(): InvitationStatus {
    return new InvitationStatus(InvitationStatusEnum.PENDING);
  }

  static accepted(): InvitationStatus {
    return new InvitationStatus(InvitationStatusEnum.ACCEPTED);
  }

  static declined(): InvitationStatus {
    return new InvitationStatus(InvitationStatusEnum.DECLINED);
  }

  static expired(): InvitationStatus {
    return new InvitationStatus(InvitationStatusEnum.EXPIRED);
  }

  static fromString(value: string): InvitationStatus {
    const enumValue = Object.values(InvitationStatusEnum).find(
      (v) => v === value,
    );
    if (!enumValue) {
      throw new Error(`Invalid invitation status: ${value}`);
    }
    return new InvitationStatus(enumValue);
  }

  get value(): InvitationStatusEnum {
    return this._value;
  }

  isPending(): boolean {
    return this._value === InvitationStatusEnum.PENDING;
  }

  isAccepted(): boolean {
    return this._value === InvitationStatusEnum.ACCEPTED;
  }

  isDeclined(): boolean {
    return this._value === InvitationStatusEnum.DECLINED;
  }

  isExpired(): boolean {
    return this._value === InvitationStatusEnum.EXPIRED;
  }

  canBeAccepted(): boolean {
    return this._value === InvitationStatusEnum.PENDING;
  }

  canBeDeclined(): boolean {
    return this._value === InvitationStatusEnum.PENDING;
  }

  equals(other: InvitationStatus): boolean {
    return this._value === other._value;
  }
}
