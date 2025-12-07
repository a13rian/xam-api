import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LogoutCommand } from './logout.command';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../../../../domain/auth/services/token.service.interface';

export interface LogoutResult {
  message: string;
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(command: LogoutCommand): Promise<LogoutResult> {
    if (command.logoutAllDevices) {
      await this.tokenService.revokeAllUserRefreshTokens(command.userId);
      return {
        message: 'Logged out from all devices successfully',
      };
    }

    if (command.refreshToken) {
      await this.tokenService.revokeRefreshToken(command.refreshToken);
    }

    return {
      message: 'Logged out successfully',
    };
  }
}
