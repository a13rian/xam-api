import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordCommand } from './change-password.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { Password } from '../../../../domain/user/value-objects/password.vo';

export interface ChangePasswordResult {
  message: string;
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<ChangePasswordResult> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.password.verify(
      command.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is the same as current password
    const isSamePassword = await user.password.verify(command.newPassword);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const userWithContext = this.eventPublisher.mergeObjectContext(user);

    const newPassword = await Password.create(command.newPassword);
    userWithContext.changePassword(newPassword);

    await this.userRepository.save(userWithContext);

    userWithContext.commit();

    return {
      message: 'Password has been changed successfully',
    };
  }
}
