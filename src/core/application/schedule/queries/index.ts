export * from './get-available-slots/get-available-slots.query';
export * from './get-available-slots/get-available-slots.handler';
export * from './get-slots-by-date-range/get-slots-by-date-range.query';
export * from './get-slots-by-date-range/get-slots-by-date-range.handler';

import { GetAvailableSlotsHandler } from './get-available-slots/get-available-slots.handler';
import { GetSlotsByDateRangeHandler } from './get-slots-by-date-range/get-slots-by-date-range.handler';

export const ScheduleQueryHandlers = [
  GetAvailableSlotsHandler,
  GetSlotsByDateRangeHandler,
];
