export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  roleIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserListItemDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

export class UserListResponseDto {
  items: UserListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
