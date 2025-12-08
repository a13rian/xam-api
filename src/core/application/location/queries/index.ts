export * from './get-location/get-location.query';
export * from './get-location/get-location.handler';
export * from './list-partner-locations/list-partner-locations.query';
export * from './list-partner-locations/list-partner-locations.handler';
export * from './get-operating-hours/get-operating-hours.query';
export * from './get-operating-hours/get-operating-hours.handler';

import { GetLocationHandler } from './get-location/get-location.handler';
import { ListPartnerLocationsHandler } from './list-partner-locations/list-partner-locations.handler';
import { GetOperatingHoursHandler } from './get-operating-hours/get-operating-hours.handler';

export const LocationQueryHandlers = [
  GetLocationHandler,
  ListPartnerLocationsHandler,
  GetOperatingHoursHandler,
];
