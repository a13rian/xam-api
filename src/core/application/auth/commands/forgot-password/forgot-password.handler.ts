import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ForgotPasswordCommand } from './forgot-password.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../../../../domain/auth/services/token.service.interface';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { PasswordResetToken } from '../../../../domain/auth/entities/password-reset-token.entity';

export interface ForgotPasswordResult {
  message: string;
  resetToken?: string;
}

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<ForgotPasswordResult> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return {
        message: 'If the email exists, a password reset link will be sent',
      };
    }

    const resetToken = PasswordResetToken.create({
      userId: user.id,
      expiresInHours: 1,
    });

    await this.tokenService.savePasswordResetToken(resetToken);

    return {
      message: 'If the email exists, a password reset link will be sent',
      resetToken: resetToken.token,
    };
  }
}
