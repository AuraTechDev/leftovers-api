import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '@prisma/client';
import { AuthUser } from '../../domain/interfaces/user.interface';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { AppleAuthGuard } from '../guards/apple-auth.guard';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
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
  googleAuthCallback(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Get('apple')
  @UseGuards(AppleAuthGuard)
  appleAuth() {
    // Authentication flow is handled in the strategy
  }

  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  appleAuthCallback(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
