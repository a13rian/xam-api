import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteUserCommand } from './delete-user.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { UserDeletedEvent } from '../../../../domain/user/events/user-deleted.event';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userWithContext = this.eventPublisher.mergeObjectContext(user);

    await this.userRepository.delete(command.id);

    userWithContext.apply(new UserDeletedEvent(user.id, user.email.value));
    userWithContext.commit();
  }
}
