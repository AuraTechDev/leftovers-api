import { Body, Controller, Get, Post, UseGuards, Patch } from '@nestjs/common';
import { RegisterDto } from '../../application/dtos/register.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '@prisma/client';
import { GetUser } from '../decorators/get-user.decorator';
import { AuthUser } from '../../domain/interfaces/user.interface';
import { UpdateProfileDto } from '../../application/dtos/update-profile.dto';
import { ChangePasswordDto } from '../../application/dtos/change-password.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { AppleAuthGuard } from '../guards/apple-auth.guard';
import {
  LoginUseCase,
  RegisterUseCase,
  RefreshTokensUseCase,
  LogoutUseCase,
  OAuthLoginUseCase,
  UpdateProfileUseCase,
  ChangePasswordUseCase,
} from '../../application/use-cases';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly oauthLoginUseCase: OAuthLoginUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.registerUseCase.execute(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@GetUser() currentUser: AuthUser) {
    return this.loginUseCase.execute(currentUser);
  }

  // User management routes (admin only)
  @Get('admin')
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAdminContent() {
    return { message: 'Solo disponible para administradores' };
  }

  @Get('business')
  @Roles(Role.BUSINESS, Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getBusinessContent() {
    return { message: 'Solo disponible para business y super admin' };
  }

  // OAuth routes
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Authentication flow is handled in the strategy
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@GetUser() currentUser: AuthUser) {
    return this.oauthLoginUseCase.execute(currentUser);
  }

  @Get('apple')
  @UseGuards(AppleAuthGuard)
  appleAuth() {
    // Authentication flow is handled in the strategy
  }

  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  appleAuthCallback(@GetUser() currentUser: AuthUser) {
    return this.oauthLoginUseCase.execute(currentUser);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() currentUser: AuthUser) {
    return currentUser;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @GetUser('id') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute(userId, updateProfileDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @GetUser('id') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.changePasswordUseCase.execute(userId, changePasswordDto);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokensUseCase.execute(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.logoutUseCase.execute(refreshTokenDto.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
