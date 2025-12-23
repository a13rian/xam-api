export class AccountServiceResponseDto {
  id: string;
  accountId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  durationMinutes: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AccountServicesListResponseDto {
  items: AccountServiceResponseDto[];
  total: number;
  page: number;
  limit: number;
}
