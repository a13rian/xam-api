import { TimeSlot } from '../entities/time-slot.entity';

export const TIME_SLOT_REPOSITORY = Symbol('TIME_SLOT_REPOSITORY');

export interface ITimeSlotRepository {
  findById(id: string): Promise<TimeSlot | null>;
  findByLocationIdAndDate(locationId: string, date: Date): Promise<TimeSlot[]>;
  findByLocationIdAndDateRange(
    locationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSlot[]>;
  findAvailableByLocationIdAndDate(
    locationId: string,
    date: Date,
  ): Promise<TimeSlot[]>;
  findByStaffIdAndDate(staffId: string, date: Date): Promise<TimeSlot[]>;
  save(slot: TimeSlot): Promise<void>;
  saveMany(slots: TimeSlot[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByLocationIdAndDateRange(
    locationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void>;
  existsOverlapping(
    locationId: string,
    date: Date,
    startTime: string,
    endTime: string,
    staffId?: string,
    excludeId?: string,
  ): Promise<boolean>;
}
