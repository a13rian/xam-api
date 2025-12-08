import { DayOfWeek } from '../../../../domain/location/entities/operating-hours.entity';

export interface OperatingHoursInput {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
}

export class SetOperatingHoursCommand {
  constructor(
    public readonly locationId: string,
    public readonly partnerId: string,
    public readonly hours: OperatingHoursInput[],
  ) {}
}
