import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BusinessModule } from '../business/business.module';
import { ProductsModule } from '../products/products.module';
import { DiscoverSectionController } from './infrastructure/controllers/discover-section.controller';
import { DiscoverController } from './infrastructure/controllers/discover.controller';
import { DiscoverSectionRepository } from './infrastructure/repositories/discover-section.repository';
import { CreateDiscoverSectionUseCase } from './application/use-cases/create-discover-section.use-case';
import { GetAllDiscoverSectionsUseCase } from './application/use-cases/get-all-discover-sections.use-case';
import { GetDiscoverSectionUseCase } from './application/use-cases/get-discover-section.use-case';
import { UpdateDiscoverSectionUseCase } from './application/use-cases/update-discover-section.use-case';
import { DeleteDiscoverSectionUseCase } from './application/use-cases/delete-discover-section.use-case';
import { GetDiscoverContentUseCase } from './application/use-cases/get-discover-content.use-case';
import { GetActiveSectionsMetadataUseCase } from './application/use-cases/get-active-sections-metadata.use-case';

@Module({
  imports: [PrismaModule, BusinessModule, ProductsModule],
  controllers: [DiscoverSectionController, DiscoverController],
  providers: [
    DiscoverSectionRepository,
    CreateDiscoverSectionUseCase,
    GetAllDiscoverSectionsUseCase,
    GetDiscoverSectionUseCase,
    UpdateDiscoverSectionUseCase,
    DeleteDiscoverSectionUseCase,
    GetDiscoverContentUseCase,
    GetActiveSectionsMetadataUseCase,
  ],
  exports: [DiscoverSectionRepository],
})
export class DiscoverModule {}
