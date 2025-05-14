import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  DiscoverSection,
  QueryConfig,
  SectionType,
} from '../../domain/entities/discover-section.entity';
import { IDiscoverSectionRepository } from '../../domain/repositories/discover-section.repository.interface';
import {
  DiscoverSection as PrismaDiscoverSection,
  SectionType as PrismaSectionType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class DiscoverSectionRepository implements IDiscoverSectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaSection: PrismaDiscoverSection): DiscoverSection {
    return {
      id: prismaSection.id,
      title: prismaSection.title,
      slug: prismaSection.slug,
      type:
        prismaSection.type === PrismaSectionType.PRODUCTS
          ? SectionType.PRODUCTS
          : SectionType.BUSINESSES,
      queryConfig: prismaSection.queryConfig as QueryConfig,
      isActive: prismaSection.isActive,
      priority: prismaSection.priority,
      createdAt: prismaSection.createdAt,
      updatedAt: prismaSection.updatedAt,
    };
  }

  private mapToPrismaType(domainType: SectionType): PrismaSectionType {
    return domainType === SectionType.PRODUCTS
      ? PrismaSectionType.PRODUCTS
      : PrismaSectionType.BUSINESSES;
  }

  async create(
    discoverSection: Omit<DiscoverSection, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DiscoverSection> {
    const prismaData: Prisma.DiscoverSectionCreateInput = {
      title: discoverSection.title,
      slug: discoverSection.slug,
      type: this.mapToPrismaType(discoverSection.type),
      queryConfig: discoverSection.queryConfig as Prisma.InputJsonValue,
      isActive: discoverSection.isActive,
      priority: discoverSection.priority,
    };

    const createdSection = await this.prisma.discoverSection.create({
      data: prismaData,
    });

    return this.mapToDomain(createdSection);
  }

  async findAll(): Promise<DiscoverSection[]> {
    const sections = await this.prisma.discoverSection.findMany({
      orderBy: {
        priority: 'desc',
      },
    });

    return sections.map((section) => this.mapToDomain(section));
  }

  async findById(id: number): Promise<DiscoverSection | null> {
    const section = await this.prisma.discoverSection.findUnique({
      where: { id },
    });

    return section ? this.mapToDomain(section) : null;
  }

  async findBySlug(slug: string): Promise<DiscoverSection | null> {
    const section = await this.prisma.discoverSection.findUnique({
      where: { slug },
    });

    return section ? this.mapToDomain(section) : null;
  }

  async update(
    id: number,
    discoverSection: Partial<
      Omit<DiscoverSection, 'id' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<DiscoverSection> {
    const prismaData: Prisma.DiscoverSectionUpdateInput = {};

    if (discoverSection.title !== undefined)
      prismaData.title = discoverSection.title;
    if (discoverSection.slug !== undefined)
      prismaData.slug = discoverSection.slug;
    if (discoverSection.isActive !== undefined)
      prismaData.isActive = discoverSection.isActive;
    if (discoverSection.priority !== undefined)
      prismaData.priority = discoverSection.priority;
    if (discoverSection.queryConfig !== undefined) {
      prismaData.queryConfig =
        discoverSection.queryConfig as Prisma.InputJsonValue;
    }

    if (discoverSection.type !== undefined) {
      prismaData.type = this.mapToPrismaType(discoverSection.type);
    }

    const updatedSection = await this.prisma.discoverSection.update({
      where: { id },
      data: prismaData,
    });

    return this.mapToDomain(updatedSection);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.discoverSection.delete({
      where: { id },
    });
  }
}
