import { RefreshToken } from '../entities/refresh-token.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';

export const TOKEN_SERVICE = Symbol('ITokenService');

export interface ITokenService {
  // Refresh Token methods
  saveRefreshToken(token: RefreshToken): Promise<void>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  revokeRefreshToken(token: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;

  // Password Reset Token methods
  savePasswordResetToken(token: PasswordResetToken): Promise<void>;
  findPasswordResetToken(token: string): Promise<PasswordResetToken | null>;
  markPasswordResetTokenAsUsed(token: string): Promise<void>;

  // Email Verification Token methods
  saveEmailVerificationToken(token: EmailVerificationToken): Promise<void>;
  findEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationToken | null>;
  markEmailVerificationTokenAsUsed(token: string): Promise<void>;
}
