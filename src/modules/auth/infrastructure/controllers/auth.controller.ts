import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../application/services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '@prisma/client';
import { AuthUser } from '../../domain/interfaces/user.interface';

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
  @UseGuards(AuthGuard('local'))
  login(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  // User management routes (admin only)
  @Get('admin')
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getAdminContent() {
    return { message: 'Solo disponible para administradores' };
  }

  @Get('business')
  @Roles(Role.BUSINESS, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getBusinessContent() {
    return { message: 'Solo disponible para business y super admin' };
  }

  // OAuth routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Authentication flow is handled in the strategy
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  appleAuth() {
    // Authentication flow is handled in the strategy
  }

  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  appleAuthCallback(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
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
