export class TimeSlotResponseDto {
  id: string;
  locationId: string;
  staffId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
}
