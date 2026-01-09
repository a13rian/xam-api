import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { BulkDeleteUsersCommand } from './bulk-delete-users.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { UserDeletedEvent } from '../../../../domain/user/events/user-deleted.event';

export interface BulkOperationResult {
  successCount: number;
  failureCount: number;
  failures: Array<{ id: string; reason: string }>;
}

@CommandHandler(BulkDeleteUsersCommand)
export class BulkDeleteUsersHandler implements ICommandHandler<BulkDeleteUsersCommand> {
  private readonly logger = new Logger(BulkDeleteUsersHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: BulkDeleteUsersCommand): Promise<BulkOperationResult> {
    const failures: Array<{ id: string; reason: string }> = [];
    let successCount = 0;

    // Filter out self-deletion attempts
    const idsToProcess = command.ids.filter((id) => {
      if (id === command.performedById) {
        failures.push({ id, reason: 'Cannot delete yourself' });
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
        await this.userRepository.delete(id);
        userWithContext.apply(new UserDeletedEvent(user.id, user.email.value));
        userWithContext.commit();
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to delete user ${id}`, error);
        failures.push({
          id,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.log(
      `Bulk delete completed: ${successCount} success, ${failures.length} failures`,
    );

    return {
      successCount,
      failureCount: failures.length,
      failures,
    };
  }
}
