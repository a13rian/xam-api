export * from './get-booking/get-booking.query';
export * from './get-booking/get-booking.handler';
export * from './list-customer-bookings/list-customer-bookings.query';
export * from './list-customer-bookings/list-customer-bookings.handler';
export * from './list-partner-bookings/list-partner-bookings.query';
export * from './list-partner-bookings/list-partner-bookings.handler';

import { GetBookingHandler } from './get-booking/get-booking.handler';
import { ListCustomerBookingsHandler } from './list-customer-bookings/list-customer-bookings.handler';
import { ListPartnerBookingsHandler } from './list-partner-bookings/list-partner-bookings.handler';

export const BookingQueryHandlers = [
  GetBookingHandler,
  ListCustomerBookingsHandler,
  ListPartnerBookingsHandler,
];
