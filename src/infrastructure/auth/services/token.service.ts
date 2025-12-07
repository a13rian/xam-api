import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITokenService } from '../../../core/domain/auth/services/token.service.interface';
import { RefreshToken } from '../../../core/domain/auth/entities/refresh-token.entity';
import { PasswordResetToken } from '../../../core/domain/auth/entities/password-reset-token.entity';
import { EmailVerificationToken } from '../../../core/domain/auth/entities/email-verification-token.entity';
import { RefreshTokenOrmEntity } from '../../persistence/typeorm/entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from '../../persistence/typeorm/entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from '../../persistence/typeorm/entities/email-verification-token.orm-entity';

@Injectable()
export class TokenService implements ITokenService {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenOrmEntity>,
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly passwordResetRepository: Repository<PasswordResetTokenOrmEntity>,
    @InjectRepository(EmailVerificationTokenOrmEntity)
    private readonly emailVerificationRepository: Repository<EmailVerificationTokenOrmEntity>,
  ) {}

  async saveRefreshToken(token: RefreshToken): Promise<void> {
    const entity = new RefreshTokenOrmEntity();
    entity.id = token.id;
    entity.token = token.token;
    entity.userId = token.userId;
    entity.userAgent = token.userAgent ?? null;
    entity.ipAddress = token.ipAddress ?? null;
    entity.expiresAt = token.expiresAt;
    entity.isRevoked = token.isRevoked;
    entity.createdAt = token.createdAt;

    await this.refreshTokenRepository.save(entity);
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const entity = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (!entity) return null;

    return RefreshToken.reconstitute({
      id: entity.id,
      token: entity.token,
      userId: entity.userId,
      userAgent: entity.userAgent ?? undefined,
      ipAddress: entity.ipAddress ?? undefined,
      expiresAt: entity.expiresAt,
      isRevoked: entity.isRevoked,
      createdAt: entity.createdAt,
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async savePasswordResetToken(token: PasswordResetToken): Promise<void> {
    const entity = new PasswordResetTokenOrmEntity();
    entity.id = token.id;
    entity.token = token.token;
    entity.userId = token.userId;
    entity.expiresAt = token.expiresAt;
    entity.isUsed = token.isUsed;
    entity.createdAt = token.createdAt;

    await this.passwordResetRepository.save(entity);
  }

  async findPasswordResetToken(
    token: string,
  ): Promise<PasswordResetToken | null> {
    const entity = await this.passwordResetRepository.findOne({
      where: { token },
    });

    if (!entity) return null;

    return PasswordResetToken.reconstitute({
      id: entity.id,
      token: entity.token,
      userId: entity.userId,
      expiresAt: entity.expiresAt,
      isUsed: entity.isUsed,
      createdAt: entity.createdAt,
    });
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await this.passwordResetRepository.update({ token }, { isUsed: true });
  }

  async saveEmailVerificationToken(
    token: EmailVerificationToken,
  ): Promise<void> {
    const entity = new EmailVerificationTokenOrmEntity();
    entity.id = token.id;
    entity.token = token.token;
    entity.userId = token.userId;
    entity.expiresAt = token.expiresAt;
    entity.isUsed = token.isUsed;
    entity.createdAt = token.createdAt;

    await this.emailVerificationRepository.save(entity);
  }

  async findEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationToken | null> {
    const entity = await this.emailVerificationRepository.findOne({
      where: { token },
    });

    if (!entity) return null;

    return EmailVerificationToken.reconstitute({
      id: entity.id,
      token: entity.token,
      userId: entity.userId,
      expiresAt: entity.expiresAt,
      isUsed: entity.isUsed,
      createdAt: entity.createdAt,
    });
  }

  async markEmailVerificationTokenAsUsed(token: string): Promise<void> {
    await this.emailVerificationRepository.update({ token }, { isUsed: true });
  }
}
