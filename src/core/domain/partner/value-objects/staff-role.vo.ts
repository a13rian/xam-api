export enum StaffRoleEnum {
  OWNER = 'owner',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export class StaffRole {
  private constructor(private readonly _value: StaffRoleEnum) {}

  static owner(): StaffRole {
    return new StaffRole(StaffRoleEnum.OWNER);
  }

  static manager(): StaffRole {
    return new StaffRole(StaffRoleEnum.MANAGER);
  }

  static staff(): StaffRole {
    return new StaffRole(StaffRoleEnum.STAFF);
  }

  static fromString(value: string): StaffRole {
    const enumValue = Object.values(StaffRoleEnum).find((v) => v === value);
    if (!enumValue) {
      throw new Error(`Invalid staff role: ${value}`);
    }
    return new StaffRole(enumValue);
  }

  get value(): StaffRoleEnum {
    return this._value;
  }

  isOwner(): boolean {
    return this._value === StaffRoleEnum.OWNER;
  }

  isManager(): boolean {
    return this._value === StaffRoleEnum.MANAGER;
  }

  isStaff(): boolean {
    return this._value === StaffRoleEnum.STAFF;
  }

  canManageStaff(): boolean {
    return (
      this._value === StaffRoleEnum.OWNER ||
      this._value === StaffRoleEnum.MANAGER
    );
  }

  canManageServices(): boolean {
    return (
      this._value === StaffRoleEnum.OWNER ||
      this._value === StaffRoleEnum.MANAGER
    );
  }

  canManageBookings(): boolean {
    return true; // All roles can manage their own bookings
  }

  equals(other: StaffRole): boolean {
    return this._value === other._value;
  }
}
