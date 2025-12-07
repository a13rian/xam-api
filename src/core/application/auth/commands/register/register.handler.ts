import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { RegisterCommand } from './register.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../../../../domain/auth/services/token.service.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { Password } from '../../../../domain/user/value-objects/password.vo';
import { EmailVerificationToken } from '../../../../domain/auth/entities/email-verification-token.entity';

export interface RegisterResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerificationToken: string;
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResult> {
    const email = Email.create(command.email);
    const password = await Password.create(command.password);

    const existingUser = await this.userRepository.exists(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (command.organizationId) {
      const organization = await this.organizationRepository.findById(
        command.organizationId,
      );
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
    }

    const user = this.eventPublisher.mergeObjectContext(
      User.create({
        email,
        password,
        firstName: command.firstName,
        lastName: command.lastName,
        organizationId: command.organizationId ?? null,
        roleIds: [],
      }),
    );

    await this.userRepository.save(user);

    const verificationToken = EmailVerificationToken.create({
      userId: user.id,
      expiresInHours: 24,
    });

    await this.tokenService.saveEmailVerificationToken(verificationToken);

    user.commit();

    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerificationToken: verificationToken.token,
    };
  }
}
