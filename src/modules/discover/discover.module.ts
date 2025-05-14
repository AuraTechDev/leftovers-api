import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DiscoverSectionController } from './infrastructure/controllers/discover-section.controller';
import { DiscoverSectionRepository } from './infrastructure/repositories/discover-section.repository';
import { CreateDiscoverSectionUseCase } from './application/use-cases/create-discover-section.use-case';
import { GetAllDiscoverSectionsUseCase } from './application/use-cases/get-all-discover-sections.use-case';
import { GetDiscoverSectionUseCase } from './application/use-cases/get-discover-section.use-case';
import { UpdateDiscoverSectionUseCase } from './application/use-cases/update-discover-section.use-case';
import { DeleteDiscoverSectionUseCase } from './application/use-cases/delete-discover-section.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [DiscoverSectionController],
  providers: [
    DiscoverSectionRepository,
    CreateDiscoverSectionUseCase,
    GetAllDiscoverSectionsUseCase,
    GetDiscoverSectionUseCase,
    UpdateDiscoverSectionUseCase,
    DeleteDiscoverSectionUseCase,
  ],
  exports: [DiscoverSectionRepository],
})
export class DiscoverModule {}
