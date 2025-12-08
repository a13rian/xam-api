export * from './create-booking/create-booking.command';
export * from './create-booking/create-booking.handler';
export * from './confirm-booking/confirm-booking.command';
export * from './confirm-booking/confirm-booking.handler';
export * from './cancel-booking/cancel-booking.command';
export * from './cancel-booking/cancel-booking.handler';
export * from './start-booking/start-booking.command';
export * from './start-booking/start-booking.handler';
export * from './complete-booking/complete-booking.command';
export * from './complete-booking/complete-booking.handler';
export * from './reschedule-booking/reschedule-booking.command';
export * from './reschedule-booking/reschedule-booking.handler';

import { CreateBookingHandler } from './create-booking/create-booking.handler';
import { ConfirmBookingHandler } from './confirm-booking/confirm-booking.handler';
import { CancelBookingHandler } from './cancel-booking/cancel-booking.handler';
import { StartBookingHandler } from './start-booking/start-booking.handler';
import { CompleteBookingHandler } from './complete-booking/complete-booking.handler';
import { RescheduleBookingHandler } from './reschedule-booking/reschedule-booking.handler';

export const BookingCommandHandlers = [
  CreateBookingHandler,
  ConfirmBookingHandler,
  CancelBookingHandler,
  StartBookingHandler,
  CompleteBookingHandler,
  RescheduleBookingHandler,
];
