export * from './create-location/create-location.command';
export * from './create-location/create-location.handler';
export * from './update-location/update-location.command';
export * from './update-location/update-location.handler';
export * from './delete-location/delete-location.command';
export * from './delete-location/delete-location.handler';
export * from './set-primary-location/set-primary-location.command';
export * from './set-primary-location/set-primary-location.handler';
export * from './set-operating-hours/set-operating-hours.command';
export * from './set-operating-hours/set-operating-hours.handler';

import { CreateLocationHandler } from './create-location/create-location.handler';
import { UpdateLocationHandler } from './update-location/update-location.handler';
import { DeleteLocationHandler } from './delete-location/delete-location.handler';
import { SetPrimaryLocationHandler } from './set-primary-location/set-primary-location.handler';
import { SetOperatingHoursHandler } from './set-operating-hours/set-operating-hours.handler';

export const LocationCommandHandlers = [
  CreateLocationHandler,
  UpdateLocationHandler,
  DeleteLocationHandler,
  SetPrimaryLocationHandler,
  SetOperatingHoursHandler,
];
