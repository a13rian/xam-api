export class AuthUserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
  roleIds: string[];
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserResponseDto;
}

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RegisterResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}

export class MessageResponseDto {
  message: string;
}
