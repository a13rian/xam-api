import { BookingTypeEnum } from '../../../../domain/service/value-objects/booking-type.vo';

export class CreateServiceCommand {
  constructor(
    public readonly partnerId: string,
    public readonly categoryId: string,
    public readonly name: string,
    public readonly price: number,
    public readonly durationMinutes: number,
    public readonly bookingType: BookingTypeEnum,
    public readonly description?: string,
    public readonly currency?: string,
    public readonly sortOrder?: number,
  ) {}
}
