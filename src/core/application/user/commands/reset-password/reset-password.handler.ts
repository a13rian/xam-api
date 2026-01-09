import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AdminResetPasswordCommand } from './reset-password.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@core/domain/user/repositories/user.repository.interface';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@core/domain/auth/services/password-hasher.interface';
import { Password } from '@core/domain/user/value-objects/password.vo';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(AdminResetPasswordCommand)
export class AdminResetPasswordHandler implements ICommandHandler<AdminResetPasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    command: AdminResetPasswordCommand,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await this.passwordHasher.hash(command.newPassword);
    const newPassword = Password.fromHash(hashedPassword);

    user.changePassword(newPassword);
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }
}
