import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { RegisterCommand } from './register.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../../../../domain/auth/services/token.service.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { Password } from '../../../../domain/user/value-objects/password.vo';
import { EmailVerificationToken } from '../../../../domain/auth/entities/email-verification-token.entity';

const DEFAULT_USER_ROLE = 'user';

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
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
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

    // Find default user role
    const defaultRole = await this.roleRepository.findByName(DEFAULT_USER_ROLE);
    const roleIds = defaultRole ? [defaultRole.id] : [];

    const user = this.eventPublisher.mergeObjectContext(
      User.create({
        email,
        password,
        firstName: command.firstName,
        lastName: command.lastName,
        roleIds,
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
