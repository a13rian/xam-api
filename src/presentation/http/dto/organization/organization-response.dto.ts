export class OrganizationResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OrganizationListItemDto {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
}

export class OrganizationListResponseDto {
  items: OrganizationListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
