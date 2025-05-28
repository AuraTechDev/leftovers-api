import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto, UserDto } from '../dtos/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { Provider, Role } from '@prisma/client';
import { env } from '../../../../config/env.config';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.authRepository.findUserByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.authRepository.createUser({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: registerDto.role || Role.USER,
      provider: Provider.LOCAL,
    });

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
    };

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl || undefined,
      provider: user.provider,
      businessId: user.businessId || undefined,
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
