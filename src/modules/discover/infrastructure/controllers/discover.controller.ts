import { Controller, Get } from '@nestjs/common';
import { GetDiscoverContentUseCase } from '../../application/use-cases/get-discover-content.use-case';
import { GetActiveSectionsMetadataUseCase } from '../../application/use-cases/get-active-sections-metadata.use-case';
import { LightDiscoverResponseDto } from '../../application/dtos/light-response.dto';
import { SectionsMetadataResponseDto } from '../../application/dtos/section-metadata.dto';

@Controller('discover')
export class DiscoverController {
  constructor(
    private readonly getDiscoverContentUseCase: GetDiscoverContentUseCase,
    private readonly getActiveSectionsMetadataUseCase: GetActiveSectionsMetadataUseCase,
  ) {}

  @Get()
  async getDiscoverContent(): Promise<LightDiscoverResponseDto> {
    return this.getDiscoverContentUseCase.execute();
  }

  @Get('sections')
  async getActiveSections(): Promise<SectionsMetadataResponseDto> {
    return this.getActiveSectionsMetadataUseCase.execute();
  }
}
