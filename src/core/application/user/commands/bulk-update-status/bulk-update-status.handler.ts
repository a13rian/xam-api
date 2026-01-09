import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { BulkUpdateStatusCommand } from './bulk-update-status.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { BulkOperationResult } from '../bulk-delete-users/bulk-delete-users.handler';

@CommandHandler(BulkUpdateStatusCommand)
export class BulkUpdateStatusHandler implements ICommandHandler<BulkUpdateStatusCommand> {
  private readonly logger = new Logger(BulkUpdateStatusHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: BulkUpdateStatusCommand,
  ): Promise<BulkOperationResult> {
    const failures: Array<{ id: string; reason: string }> = [];
    let successCount = 0;

    // Filter out self-deactivation attempts
    const idsToProcess = command.ids.filter((id) => {
      if (id === command.performedById && !command.isActive) {
        failures.push({ id, reason: 'Cannot deactivate yourself' });
        return false;
      }
      return true;
    });

    for (const id of idsToProcess) {
      try {
        const user = await this.userRepository.findById(id);
        if (!user) {
          failures.push({ id, reason: 'User not found' });
          continue;
        }

        const userWithContext = this.eventPublisher.mergeObjectContext(user);

        if (command.isActive) {
          userWithContext.activate();
        } else {
          userWithContext.deactivate();
        }

        await this.userRepository.save(userWithContext);
        userWithContext.commit();
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to update status for user ${id}`, error);
        failures.push({
          id,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const action = command.isActive ? 'activated' : 'deactivated';
    this.logger.log(
      `Bulk ${action} completed: ${successCount} success, ${failures.length} failures`,
    );

    return {
      successCount,
      failureCount: failures.length,
      failures,
    };
  }
}
