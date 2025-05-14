import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DiscoverSectionRepository } from '../discover-section.repository';
import { SectionType } from '../../../domain/entities/discover-section.entity';
import {
  DiscoverSection as PrismaDiscoverSection,
  SectionType as PrismaSectionType,
} from '@prisma/client';

// Mock PrismaService
const mockPrismaService = {
  discoverSection: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DiscoverSectionRepository', () => {
  let repository: DiscoverSectionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoverSectionRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<DiscoverSectionRepository>(
      DiscoverSectionRepository,
    );

    // Reset mock calls between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a discover section', async () => {
      const sectionToCreate = {
        title: 'Test Section',
        slug: 'test-section',
        type: SectionType.PRODUCTS,
        queryConfig: { maxItems: 5 },
        isActive: true,
        priority: 10,
      };

      // Prepare Prisma response with dates
      const createdPrismaSection: PrismaDiscoverSection = {
        id: 1,
        title: sectionToCreate.title,
        slug: sectionToCreate.slug,
        type: PrismaSectionType.PRODUCTS,
        queryConfig: sectionToCreate.queryConfig,
        isActive: sectionToCreate.isActive,
        priority: sectionToCreate.priority,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.discoverSection.create.mockResolvedValue(
        createdPrismaSection,
      );

      // Execute repository method
      const result = await repository.create(sectionToCreate);

      // Verify correct method with correct params was called
      expect(mockPrismaService.discoverSection.create).toHaveBeenCalledWith({
        data: {
          title: sectionToCreate.title,
          slug: sectionToCreate.slug,
          type: PrismaSectionType.PRODUCTS,
          queryConfig: sectionToCreate.queryConfig,
          isActive: sectionToCreate.isActive,
          priority: sectionToCreate.priority,
        },
      });

      // Verify domain model mapping
      expect(result).toEqual({
        id: createdPrismaSection.id,
        title: createdPrismaSection.title,
        slug: createdPrismaSection.slug,
        type: SectionType.PRODUCTS,
        queryConfig: createdPrismaSection.queryConfig,
        isActive: createdPrismaSection.isActive,
        priority: createdPrismaSection.priority,
        createdAt: createdPrismaSection.createdAt,
        updatedAt: createdPrismaSection.updatedAt,
      });
    });
  });

  describe('findAll', () => {
    it('should return all discover sections ordered by priority', async () => {
      const prismaSections: PrismaDiscoverSection[] = [
        {
          id: 1,
          title: 'High Priority Section',
          slug: 'high-priority',
          type: PrismaSectionType.PRODUCTS,
          queryConfig: { maxItems: 5 },
          isActive: true,
          priority: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Low Priority Section',
          slug: 'low-priority',
          type: PrismaSectionType.BUSINESSES,
          queryConfig: { distance: 5 },
          isActive: true,
          priority: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.discoverSection.findMany.mockResolvedValue(
        prismaSections,
      );

      const results = await repository.findAll();

      expect(mockPrismaService.discoverSection.findMany).toHaveBeenCalledWith({
        orderBy: {
          priority: 'desc',
        },
      });

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('High Priority Section');
      expect(results[0].type).toBe(SectionType.PRODUCTS);
      expect(results[1].title).toBe('Low Priority Section');
      expect(results[1].type).toBe(SectionType.BUSINESSES);
    });
  });

  describe('findById', () => {
    it('should return a section by id', async () => {
      const prismaSection: PrismaDiscoverSection = {
        id: 1,
        title: 'Test Section',
        slug: 'test-section',
        type: PrismaSectionType.PRODUCTS,
        queryConfig: { maxItems: 5 },
        isActive: true,
        priority: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.discoverSection.findUnique.mockResolvedValue(
        prismaSection,
      );

      const result = await repository.findById(1);

      expect(mockPrismaService.discoverSection.findUnique).toHaveBeenCalledWith(
        {
          where: { id: 1 },
        },
      );

      expect(result).toEqual({
        id: prismaSection.id,
        title: prismaSection.title,
        slug: prismaSection.slug,
        type: SectionType.PRODUCTS,
        queryConfig: prismaSection.queryConfig,
        isActive: prismaSection.isActive,
        priority: prismaSection.priority,
        createdAt: prismaSection.createdAt,
        updatedAt: prismaSection.updatedAt,
      });
    });

    it('should return null when section not found', async () => {
      mockPrismaService.discoverSection.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(mockPrismaService.discoverSection.findUnique).toHaveBeenCalledWith(
        {
          where: { id: 999 },
        },
      );

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return a section by slug', async () => {
      const prismaSection: PrismaDiscoverSection = {
        id: 1,
        title: 'Test Section',
        slug: 'test-section',
        type: PrismaSectionType.PRODUCTS,
        queryConfig: { maxItems: 5 },
        isActive: true,
        priority: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.discoverSection.findUnique.mockResolvedValue(
        prismaSection,
      );

      const result = await repository.findBySlug('test-section');

      expect(mockPrismaService.discoverSection.findUnique).toHaveBeenCalledWith(
        {
          where: { slug: 'test-section' },
        },
      );

      expect(result).toBeDefined();
      expect(result?.slug).toBe('test-section');
    });

    it('should return null when slug not found', async () => {
      mockPrismaService.discoverSection.findUnique.mockResolvedValue(null);

      const result = await repository.findBySlug('non-existent-slug');

      expect(mockPrismaService.discoverSection.findUnique).toHaveBeenCalledWith(
        {
          where: { slug: 'non-existent-slug' },
        },
      );

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a section with all fields', async () => {
      const updateData = {
        title: 'Updated Section',
        slug: 'updated-section',
        type: SectionType.BUSINESSES,
        queryConfig: { maxItems: 10 },
        isActive: false,
        priority: 5,
      };

      const updatedPrismaSection: PrismaDiscoverSection = {
        id: 1,
        ...updateData,
        type: PrismaSectionType.BUSINESSES,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.discoverSection.update.mockResolvedValue(
        updatedPrismaSection,
      );

      const result = await repository.update(1, updateData);

      expect(mockPrismaService.discoverSection.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: updateData.title,
          slug: updateData.slug,
          type: PrismaSectionType.BUSINESSES,
          queryConfig: updateData.queryConfig,
          isActive: updateData.isActive,
          priority: updateData.priority,
        },
      });

      expect(result.title).toBe('Updated Section');
      expect(result.slug).toBe('updated-section');
      expect(result.type).toBe(SectionType.BUSINESSES);
    });

    it('should update only specified fields', async () => {
      const partialUpdate = {
        title: 'Partial Update',
        priority: 15,
      };

      const existingSection = {
        id: 1,
        title: 'Original Title',
        slug: 'original-slug',
        type: PrismaSectionType.PRODUCTS,
        queryConfig: { maxItems: 5 },
        isActive: true,
        priority: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPrismaSection = {
        ...existingSection,
        title: partialUpdate.title,
        priority: partialUpdate.priority,
      };

      mockPrismaService.discoverSection.update.mockResolvedValue(
        updatedPrismaSection,
      );

      const result = await repository.update(1, partialUpdate);

      expect(mockPrismaService.discoverSection.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: partialUpdate.title,
          priority: partialUpdate.priority,
        },
      });

      expect(result.title).toBe('Partial Update');
      expect(result.priority).toBe(15);
      expect(result.slug).toBe('original-slug'); // unchanged
      expect(result.isActive).toBe(true); // unchanged
    });
  });

  describe('delete', () => {
    it('should delete a section by id', async () => {
      mockPrismaService.discoverSection.delete.mockResolvedValue({});

      await repository.delete(1);

      expect(mockPrismaService.discoverSection.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
