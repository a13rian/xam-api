export class ServiceResponseDto {
  id: string;
  partnerId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  durationMinutes: number;
  bookingType: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ServicesListResponseDto {
  items: ServiceResponseDto[];
  total: number;
  page: number;
  limit: number;
}
