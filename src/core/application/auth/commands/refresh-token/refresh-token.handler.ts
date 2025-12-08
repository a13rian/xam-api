import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenCommand } from './refresh-token.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../../../../domain/auth/services/token.service.interface';
import { RefreshToken } from '../../../../domain/auth/entities/refresh-token.entity';

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const existingToken = await this.tokenService.findRefreshToken(
      command.refreshToken,
    );

    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingToken.isExpired || existingToken.isRevoked) {
      throw new UnauthorizedException('Refresh token is expired or revoked');
    }

    const user = await this.userRepository.findById(existingToken.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    await this.tokenService.revokeRefreshToken(existingToken.token);

    const payload = {
      sub: user.id,
      email: user.email.value,
      roleIds: [...user.roleIds],
      roleNames: [...user.roleNames],
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = 3600;

    const newRefreshToken = RefreshToken.create({
      userId: user.id,
      userAgent: command.userAgent,
      ipAddress: command.ipAddress,
      expiresInDays: 30,
    });

    await this.tokenService.saveRefreshToken(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
      expiresIn,
    };
  }
}
