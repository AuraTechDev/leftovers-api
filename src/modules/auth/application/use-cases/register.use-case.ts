import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto, UserDto } from '../dtos/auth-response.dto';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Provider, Role } from '@prisma/client';

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
      photoUrl: user.photoUrl || undefined,
      provider: user.provider,
      businessId: user.businessId || undefined,
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
