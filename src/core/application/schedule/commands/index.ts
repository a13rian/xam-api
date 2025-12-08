export * from './generate-slots/generate-slots.command';
export * from './generate-slots/generate-slots.handler';
export * from './block-slot/block-slot.command';
export * from './block-slot/block-slot.handler';
export * from './unblock-slot/unblock-slot.command';
export * from './unblock-slot/unblock-slot.handler';

import { GenerateSlotsHandler } from './generate-slots/generate-slots.handler';
import { BlockSlotHandler } from './block-slot/block-slot.handler';
import { UnblockSlotHandler } from './unblock-slot/unblock-slot.handler';

export const ScheduleCommandHandlers = [
  GenerateSlotsHandler,
  BlockSlotHandler,
  UnblockSlotHandler,
];
