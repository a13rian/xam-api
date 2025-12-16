import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  RegisterResponseDto,
  MessageResponseDto,
  UpdateProfileDto,
} from '../dto/auth';
import {
  RegisterCommand,
  LoginCommand,
  RefreshTokenCommand,
  ForgotPasswordCommand,
  ResetPasswordCommand,
  ChangePasswordCommand,
  VerifyEmailCommand,
  LogoutCommand,
} from '../../../core/application/auth/commands';
import { RegisterResult } from '../../../core/application/auth/commands/register/register.handler';
import { GetMeQuery } from '../../../core/application/auth/queries';
import { GetMeResult } from '../../../core/application/auth/queries/get-me/get-me.handler';
import { UpdateUserCommand } from '../../../core/application/user/commands';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    const result: RegisterResult = await this.commandBus.execute(
      new RegisterCommand(dto.email, dto.password, dto.firstName, dto.lastName),
    );

    return {
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      message: 'Registration successful. Please verify your email.',
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    return await this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, userAgent, ipAddress),
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<RefreshTokenResponseDto> {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    return await this.commandBus.execute(
      new RefreshTokenCommand(dto.refreshToken, userAgent, ipAddress),
    );
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    const result: { message: string } = await this.commandBus.execute(
      new ForgotPasswordCommand(dto.email),
    );
    return { message: result.message };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    return await this.commandBus.execute(
      new ResetPasswordCommand(dto.token, dto.newPassword),
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    const result: { message: string } = await this.commandBus.execute(
      new ChangePasswordCommand(user.id, dto.currentPassword, dto.newPassword),
    );
    return { message: result.message };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<MessageResponseDto> {
    return await this.commandBus.execute(new VerifyEmailCommand(dto.token));
  }

  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<GetMeResult> {
    return await this.queryBus.execute(new GetMeQuery(user.id));
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<GetMeResult> {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
    }: UpdateProfileDto = dto;

    await this.commandBus.execute(
      new UpdateUserCommand(
        user.id,
        firstName,
        lastName,
        phone ?? null,
        dateOfBirth ? new Date(dateOfBirth) : null,
        gender ?? null,
      ),
    );

    return await this.queryBus.execute(new GetMeQuery(user.id));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { refreshToken?: string; logoutAllDevices?: boolean },
  ): Promise<MessageResponseDto> {
    return await this.commandBus.execute(
      new LogoutCommand(
        user.id,
        body.refreshToken,
        body.logoutAllDevices ?? false,
      ),
    );
  }
}
