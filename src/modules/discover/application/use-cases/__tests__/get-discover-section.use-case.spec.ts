import { Test } from '@nestjs/testing';
import { GetDiscoverSectionUseCase } from '../get-discover-section.use-case';
import { setupMockDiscoverSectionRepository } from '../../../__mocks__/discover-section-repository.mock';
import {
  mockDiscoverSection,
  mockInactiveDiscoverSection,
} from '../../../__mocks__/discover-section.mocks';
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

describe('GetDiscoverSectionUseCase', () => {
  let useCase: GetDiscoverSectionUseCase;
  let discoverSectionRepository: DiscoverSectionRepositoryInterface;

  beforeEach(async () => {
    // Setup repository mock
    const mockRepo = setupMockDiscoverSectionRepository();

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetDiscoverSectionUseCase,
        {
          provide: DiscoverSectionRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = moduleRef.get<GetDiscoverSectionUseCase>(
      GetDiscoverSectionUseCase,
    );
    discoverSectionRepository = moduleRef.get(DiscoverSectionRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should get an active section by id', async () => {
    const sectionId = 1;

    // Use arrow function to avoid unbound method linter warning
    const findByIdSpy = jest.spyOn(discoverSectionRepository, 'findById');
    findByIdSpy.mockResolvedValue(mockDiscoverSection);

    const result = await useCase.execute(sectionId);

    expect(result).toBeDefined();
    expect(result.id).toBe(mockDiscoverSection.id);
    expect(result.title).toBe(mockDiscoverSection.title);
    expect(result.slug).toBe(mockDiscoverSection.slug);
    expect(findByIdSpy).toHaveBeenCalledWith(sectionId);
  });

  it('should get an inactive section by id', async () => {
    const sectionId = 2;

    // Use arrow function to avoid unbound method linter warning
    const findByIdSpy = jest.spyOn(discoverSectionRepository, 'findById');
    findByIdSpy.mockResolvedValue(mockInactiveDiscoverSection);

    const result = await useCase.execute(sectionId);

    expect(result).toBeDefined();
    expect(result.id).toBe(mockInactiveDiscoverSection.id);
    expect(result.title).toBe(mockInactiveDiscoverSection.title);
    expect(result.isActive).toBe(false);
    expect(findByIdSpy).toHaveBeenCalledWith(sectionId);
  });

  it('should throw NotFoundException when section does not exist', async () => {
    const nonExistentId = 999;

    // Use arrow function to avoid unbound method linter warning
    const findByIdSpy = jest.spyOn(discoverSectionRepository, 'findById');
    findByIdSpy.mockResolvedValue(null);

    await expect(useCase.execute(nonExistentId)).rejects.toThrow(
      NotFoundException,
    );
    expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
  });
});
