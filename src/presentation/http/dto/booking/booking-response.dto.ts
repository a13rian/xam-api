import { BookingStatusEnum } from '../../../../core/domain/booking/value-objects/booking-status.vo';

export class BookingServiceResponseDto {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  currency: string;
  durationMinutes: number;
}

export class BookingResponseDto {
  id: string;
  customerId: string;
  partnerId: string;
  locationId: string;
  staffId?: string;
  status: BookingStatusEnum;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  isHomeService: boolean;
  customerAddress?: string;
  customerPhone?: string;
  customerName?: string;
  notes?: string;
  cancellationReason?: string;
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  services: BookingServiceResponseDto[];
}

export class BookingsListResponseDto {
  items: BookingResponseDto[];
  total: number;
  page: number;
  limit: number;
}
