import { OperatingHours, DayOfWeek } from '../entities/operating-hours.entity';

export const OPERATING_HOURS_REPOSITORY = Symbol('OPERATING_HOURS_REPOSITORY');

export interface IOperatingHoursRepository {
  findById(id: string): Promise<OperatingHours | null>;
  findByLocationId(locationId: string): Promise<OperatingHours[]>;
  findByLocationIdAndDay(
    locationId: string,
    dayOfWeek: DayOfWeek,
  ): Promise<OperatingHours | null>;
  save(hours: OperatingHours): Promise<void>;
  saveMany(hours: OperatingHours[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByLocationId(locationId: string): Promise<void>;
}
