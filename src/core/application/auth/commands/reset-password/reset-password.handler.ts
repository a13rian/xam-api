import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../../../../domain/auth/services/token.service.interface';
import { Password } from '../../../../domain/user/value-objects/password.vo';

export interface ResetPasswordResult {
  message: string;
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
    const resetToken = await this.tokenService.findPasswordResetToken(
      command.token,
    );

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.isExpired || resetToken.isUsed) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userRepository.findById(resetToken.userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userWithContext = this.eventPublisher.mergeObjectContext(user);

    const newPassword = await Password.create(command.newPassword);
    userWithContext.changePassword(newPassword);

    if (user.isLocked) {
      userWithContext.unlock();
    }

    await this.userRepository.save(userWithContext);
    await this.tokenService.markPasswordResetTokenAsUsed(command.token);
    await this.tokenService.revokeAllUserRefreshTokens(user.id);

    userWithContext.commit();

    return {
      message: 'Password has been reset successfully',
    };
  }
}
