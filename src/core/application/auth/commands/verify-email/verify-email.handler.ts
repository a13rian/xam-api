import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { VerifyEmailCommand } from './verify-email.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../../../../domain/auth/services/token.service.interface';

export interface VerifyEmailResult {
  message: string;
}

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
    const verificationToken =
      await this.tokenService.findEmailVerificationToken(command.token);

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (verificationToken.isExpired || verificationToken.isUsed) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.userRepository.findById(verificationToken.userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      return {
        message: 'Email is already verified',
      };
    }

    const userWithContext = this.eventPublisher.mergeObjectContext(user);
    userWithContext.verifyEmail();

    await this.userRepository.save(userWithContext);
    await this.tokenService.markEmailVerificationTokenAsUsed(command.token);

    userWithContext.commit();

    return {
      message: 'Email has been verified successfully',
    };
  }
}
