import { Test } from '@nestjs/testing';
import { UpdateDiscoverSectionUseCase } from '../update-discover-section.use-case';
import { setupMockDiscoverSectionRepository } from '../../../__mocks__/discover-section-repository.mock';
import { mockDiscoverSection } from '../../../__mocks__/discover-section.mocks';
import { UpdateDiscoverSectionDto } from '../../dtos/update-discover-section.dto';
import { NotFoundException } from '@nestjs/common';
import { DiscoverSectionRepository } from '../../../infrastructure/repositories/discover-section.repository';

// Define the interface for mocking
interface DiscoverSectionRepositoryInterface {
  findById: (id: number) => Promise<any>;
  findAll: () => Promise<any[]>;
  findBySlug: (slug: string) => Promise<any>;
  create: (data: any) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  delete: (id: number) => Promise<void>;
}

describe('UpdateDiscoverSectionUseCase', () => {
  let useCase: UpdateDiscoverSectionUseCase;
  let discoverSectionRepository: DiscoverSectionRepositoryInterface;

  beforeEach(async () => {
    // Setup repository mock
    const mockRepo = setupMockDiscoverSectionRepository();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateDiscoverSectionUseCase,
        {
          provide: DiscoverSectionRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = moduleRef.get<UpdateDiscoverSectionUseCase>(
      UpdateDiscoverSectionUseCase,
    );
    discoverSectionRepository = moduleRef.get(DiscoverSectionRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a section successfully', async () => {
    const sectionId = 1;
    const updateDto: UpdateDiscoverSectionDto = {
      title: 'Updated Title',
      isActive: false,
      priority: 20,
    };

    const updatedSection = {
      ...mockDiscoverSection,
      ...updateDto,
      updatedAt: new Date(),
    };

    // Use arrow functions to avoid unbound method linter warnings
    const findByIdSpy = jest.spyOn(discoverSectionRepository, 'findById');
    findByIdSpy.mockResolvedValue(mockDiscoverSection);

    const updateSpy = jest.spyOn(discoverSectionRepository, 'update');
    updateSpy.mockResolvedValue(updatedSection);

    const result = await useCase.execute(sectionId, updateDto);

    expect(result).toBeDefined();
    expect(result.id).toBe(mockDiscoverSection.id);
    expect(result.title).toBe(updateDto.title);
    expect(result.isActive).toBe(updateDto.isActive);
    expect(result.priority).toBe(updateDto.priority);
    expect(findByIdSpy).toHaveBeenCalledWith(sectionId);
    expect(updateSpy).toHaveBeenCalledWith(sectionId, updateDto);
  });

  it('should update queryConfig successfully', async () => {
    const sectionId = 1;
    const updateDto: UpdateDiscoverSectionDto = {
      queryConfig: { maxItems: 10, category: 'food' },
    };

    const updatedSection = {
      ...mockDiscoverSection,
      queryConfig: updateDto.queryConfig,
      updatedAt: new Date(),
    };

    // Use arrow functions to avoid unbound method linter warnings
    const findByIdSpy = jest.spyOn(discoverSectionRepository, 'findById');
    findByIdSpy.mockResolvedValue(mockDiscoverSection);

    const updateSpy = jest.spyOn(discoverSectionRepository, 'update');
    updateSpy.mockResolvedValue(updatedSection);

    const result = await useCase.execute(sectionId, updateDto);

    expect(result).toBeDefined();
    expect(result.queryConfig).toEqual(updateDto.queryConfig);
    expect(updateSpy).toHaveBeenCalledWith(sectionId, updateDto);
  });

  it('should throw NotFoundException when section does not exist', async () => {
    const nonExistentId = 999;
    const updateDto: UpdateDiscoverSectionDto = {
      title: 'Updated Title',
    };

    // Use arrow functions to avoid unbound method linter warnings
    const findByIdSpy = jest.spyOn(discoverSectionRepository, 'findById');
    findByIdSpy.mockResolvedValue(null);

    const updateSpy = jest.spyOn(discoverSectionRepository, 'update');

    await expect(useCase.execute(nonExistentId, updateDto)).rejects.toThrow(
      NotFoundException,
    );
    expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
