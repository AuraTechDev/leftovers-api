import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  CreateUserUseCase,
  GetUserUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
} from '../../application/use-cases';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../../../auth/infrastructure/decorators/get-user.decorator';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() userData: CreateUserDto,
    @GetUser() currentUser: AuthUser,
  ): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(userData, currentUser.role);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async getUsers(): Promise<UserResponseDto[]> {
    return this.getUsersUseCase.execute();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.getUserUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: UpdateUserDto,
    @GetUser() currentUser: AuthUser,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute(id, userData, currentUser.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }
}
