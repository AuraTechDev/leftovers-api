import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto } from '../../infrastructure/dto/register.dto';
import { OAuthLoginDto } from '../../infrastructure/dto/oauth-login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { Provider, Role } from '@prisma/client';
import { AuthUser } from '../../domain/interfaces/user.interface';

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

  login(user: AuthUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

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

    return {
      user: result,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
