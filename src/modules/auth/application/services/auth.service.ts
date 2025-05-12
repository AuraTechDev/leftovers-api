import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto } from '../../infrastructure/dto/register.dto';
import { OAuthLoginDto } from '../../infrastructure/dto/oauth-login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { Provider, Role } from '@prisma/client';
import { AuthUser } from '../../domain/interfaces/user.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email, provider: Provider.LOCAL },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async validateOAuthUser(oauthData: OAuthLoginDto): Promise<User> {
    let user = await this.prisma.user.findFirst({
      where: {
        provider: oauthData.provider,
        providerId: oauthData.providerId,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: oauthData.email,
          name: oauthData.name,
          photoUrl: oauthData.photoUrl,
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          role: Role.USER,
        },
      });
    }

    if (user.name !== oauthData.name || user.photoUrl !== oauthData.photoUrl) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: oauthData.name,
          photoUrl: oauthData.photoUrl,
        },
      });
    }

    return user;
  }

  private generateRefreshToken(): string {
    return randomBytes(40).toString('hex');
  }

  private async createRefreshToken(userId: number): Promise<string> {
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return refreshToken;
  }

  private async removeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  async login(user: AuthUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photoUrl: user.photoUrl,
        provider: user.provider,
      },
      accessToken: this.jwtService.sign(payload),
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        role: registerDto.role || Role.USER,
        provider: Provider.LOCAL,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    const payload = {
      sub: result.id,
      email: result.email,
      role: result.role,
    };

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: result,
      accessToken: this.jwtService.sign(payload),
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Remove the used refresh token
    await this.removeRefreshToken(refreshToken);

    const payload = {
      sub: token.user.id,
      email: token.user.email,
      role: token.user.role,
    };

    // Generate new tokens
    const newRefreshToken = await this.createRefreshToken(token.user.id);

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await this.removeRefreshToken(refreshToken);
  }
}
