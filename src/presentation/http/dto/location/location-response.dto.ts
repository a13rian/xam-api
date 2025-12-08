export class LocationResponseDto {
  id: string;
  partnerId: string;
  name: string;
  street: string;
  ward?: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OperatingHoursResponseDto {
  id: string;
  locationId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}
