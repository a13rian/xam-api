export class RoleResponseDto {
  id: string;
  name: string;
  description: string;
  organizationId: string | null;
  isSystem: boolean;
  permissionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class RoleListItemDto {
  id: string;
  name: string;
  description: string;
  organizationId: string | null;
  isSystem: boolean;
  permissionCount: number;
  createdAt: Date;
}

export class RoleListResponseDto {
  items: RoleListItemDto[];
}

export class PermissionResponseDto {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export class PermissionListResponseDto {
  items: PermissionResponseDto[];
}
