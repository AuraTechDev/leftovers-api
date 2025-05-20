import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '@prisma/client';

// Food Types Use Cases
import { CreateFoodTypeUseCase } from '../../application/use-cases/create-food-type.use-case';
import { GetAllFoodTypesUseCase } from '../../application/use-cases/get-all-food-types.use-case';
import { UpdateFoodTypeUseCase } from '../../application/use-cases/update-food-type.use-case';
import { DeleteFoodTypeUseCase } from '../../application/use-cases/delete-food-type.use-case';

// DTOs
import { CreateFoodTypeDto } from '../../application/dtos/create-food-type.dto';
import { UpdateFoodTypeDto } from '../../application/dtos/update-food-type.dto';

@Controller('food-types')
export class FoodTypesController {
  constructor(
    private readonly createFoodTypeUseCase: CreateFoodTypeUseCase,
    private readonly getAllFoodTypesUseCase: GetAllFoodTypesUseCase,
    private readonly updateFoodTypeUseCase: UpdateFoodTypeUseCase,
    private readonly deleteFoodTypeUseCase: DeleteFoodTypeUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createFoodType(@Body() createFoodTypeDto: CreateFoodTypeDto) {
    return this.createFoodTypeUseCase.execute(createFoodTypeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllFoodTypes() {
    return this.getAllFoodTypesUseCase.execute();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async updateFoodType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFoodTypeDto: UpdateFoodTypeDto,
  ) {
    return this.updateFoodTypeUseCase.execute(id, updateFoodTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFoodType(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteFoodTypeUseCase.execute(id);
  }
}
