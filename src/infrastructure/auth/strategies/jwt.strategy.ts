import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfigService } from '../../config/jwt.config.js';
import { RequestContextStorage } from '../../logging/request-context.storage.js';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface.js';

interface JwtPayload {
  sub: string;
  email: string;
  roleIds: string[];
  roleNames: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtConfig: JwtConfigService,
    private readonly contextStorage: RequestContextStorage,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    const user: AuthenticatedUser = {
      id: payload.sub,
      email: payload.email,
      roleIds: payload.roleIds,
      roleNames: payload.roleNames || [],
    };

    // Update request context with authenticated user info
    const context = this.contextStorage.getContext();
    if (context) {
      context.setUser(user.id, user.email);
    }

    return user;
  }
}
