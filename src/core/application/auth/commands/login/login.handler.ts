import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginCommand } from './login.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../../../../domain/auth/services/token.service.interface';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { RefreshToken } from '../../../../domain/auth/entities/refresh-token.entity';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string | null;
    roleIds: string[];
  };
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    private readonly jwtService: JwtService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    if (user.isLocked) {
      throw new ForbiddenException(
        'Account is locked due to too many failed login attempts',
      );
    }

    const userWithContext = this.eventPublisher.mergeObjectContext(user);
    const isPasswordValid = await user.password.verify(command.password);

    if (!isPasswordValid) {
      userWithContext.recordFailedLogin();
      await this.userRepository.save(userWithContext);
      userWithContext.commit();
      throw new UnauthorizedException('Invalid credentials');
    }

    userWithContext.recordSuccessfulLogin();
    await this.userRepository.save(userWithContext);

    const payload = {
      sub: user.id,
      email: user.email.value,
      organizationId: user.organizationId,
      roleIds: [...user.roleIds],
      roleNames: [...user.roleNames],
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = 3600;

    const refreshToken = RefreshToken.create({
      userId: user.id,
      userAgent: command.userAgent,
      ipAddress: command.ipAddress,
      expiresInDays: 30,
    });

    await this.tokenService.saveRefreshToken(refreshToken);

    userWithContext.commit();

    return {
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn,
      user: {
        id: user.id,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        roleIds: [...user.roleIds],
      },
    };
  }
}
