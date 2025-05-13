import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { TokensResponseDto } from '../dtos/auth-response.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshToken: string): Promise<TokensResponseDto> {
    const token = await this.authRepository.findRefreshToken(refreshToken);

    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.authRepository.deleteRefreshToken(refreshToken);

    const payload = {
      sub: token.user.id,
      email: token.user.email,
      role: token.user.role,
    };

    const newRefreshToken = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createRefreshToken(
      token.user.id,
      newRefreshToken,
      expiresAt,
    );

    return TokensResponseDto.create(
      this.jwtService.sign(payload),
      newRefreshToken,
    );
  }

  private generateRefreshToken(): string {
    return randomBytes(40).toString('hex');
  }
}
