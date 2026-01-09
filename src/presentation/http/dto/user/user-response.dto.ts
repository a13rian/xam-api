export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  roleIds: string[];
  roleNames: string[];
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserListItemDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  roleNames: string[];
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export class UserListResponseDto {
  items: UserListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
