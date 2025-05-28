import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto, UserDto } from '../dtos/auth-response.dto';
import { AuthUser } from '../../domain/interfaces/user.interface';
import { env } from '../../../../config/env.config';
import { randomUUID } from 'crypto';

@Injectable()
export class LoginUseCase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(user: AuthUser): Promise<AuthResponseDto> {
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
      jti: randomUUID(),
    };

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl,
      provider: user.provider,
      businessId: user.businessId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: env.JWT_EXPIRATION_TIME,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: env.JWT_REFRESH_EXPIRATION_TIME,
      }),
    ]);

    return AuthResponseDto.create(userDto, accessToken, refreshToken);
  }
}
