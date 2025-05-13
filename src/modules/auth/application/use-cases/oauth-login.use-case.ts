import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AuthResponseDto, UserDto } from '../dtos/auth-response.dto';
import { randomBytes } from 'crypto';
import { AuthUser } from '../../domain/interfaces/user.interface';

@Injectable()
export class OAuthLoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(user: AuthUser): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createRefreshToken(
      user.id,
      refreshToken,
      expiresAt,
    );

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl,
      provider: user.provider,
      businessId: user.businessId,
    };

    return AuthResponseDto.create(
      userDto,
      this.jwtService.sign(payload),
      refreshToken,
    );
  }

  private generateRefreshToken(): string {
    return randomBytes(40).toString('hex');
  }
}
