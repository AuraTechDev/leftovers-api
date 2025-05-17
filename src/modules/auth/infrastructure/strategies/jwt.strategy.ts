import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { authConfig } from '../../../../config/auth.config';
import { AuthRepository } from '../repositories/auth.repository';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authRepository: AuthRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt.secret,
      audience: authConfig.jwt.audience,
      issuer: authConfig.jwt.issuer,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.authRepository.findUserById(payload.sub);
      
      if (!user || user.isBlocked) {
        throw new UnauthorizedException('User is not authorized');
      }
      
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
