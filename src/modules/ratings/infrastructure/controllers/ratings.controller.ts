import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { GetUser } from '../../../auth/infrastructure/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import { CreateRatingDto } from '../../application/dtos/create-rating.dto';
import { SubmitRatingUseCase } from '../../application/use-cases/submit-rating.use-case';
import { GetBusinessRatingsUseCase } from '../../application/use-cases/get-business-ratings.use-case';
import { BusinessRatingsQueryDto } from '../../application/dtos/business-ratings-query.dto';

@Controller('ratings')
export class RatingsController {
  constructor(
    private readonly submitRatingUseCase: SubmitRatingUseCase,
    private readonly getBusinessRatingsUseCase: GetBusinessRatingsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  async submitRating(
    @GetUser('id') userId: number,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.submitRatingUseCase.execute(userId, createRatingDto);
  }

  @Get('business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  async getBusinessRatings(
    @GetUser('businessId') businessId: number,
    @Query() query: BusinessRatingsQueryDto,
  ) {
    return this.getBusinessRatingsUseCase.execute(businessId, query);
  }
}
