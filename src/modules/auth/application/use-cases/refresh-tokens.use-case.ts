import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokensResponseDto } from '../dtos/auth-response.dto';
import { env } from '../../../../config/env.config';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokensUseCase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(refreshToken: string): Promise<TokensResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const accessTokenPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        type: 'access',
      };

      const newRefreshTokenPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        type: 'refresh',
      };

      const [accessToken, newRefreshToken] = await Promise.all([
        this.jwtService.signAsync(accessTokenPayload, {
          expiresIn: env.JWT_EXPIRATION_TIME,
        }),
        this.jwtService.signAsync(newRefreshTokenPayload, {
          expiresIn: env.JWT_REFRESH_EXPIRATION_TIME,
        }),
      ]);

      return TokensResponseDto.create(accessToken, newRefreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
