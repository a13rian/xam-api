import { IsDateString } from 'class-validator';

export class GetSlotsQueryDto {
  @IsDateString()
  date: string;
}

export class GetSlotsByRangeQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
