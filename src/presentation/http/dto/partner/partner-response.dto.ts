export class PartnerResponseDto {
  id: string;
  userId: string;
  type: string;
  status: string;
  businessName: string;
  description: string | null;
  rating: number;
  reviewCount: number;
  isHomeServiceEnabled: boolean;
  homeServiceRadiusKm: number | null;
  rejectionReason: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PartnerListItemDto {
  id: string;
  userId: string;
  type: string;
  status: string;
  businessName: string;
  createdAt: Date;
}

export class PendingPartnersResponseDto {
  partners: PartnerListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
