import { Test } from '@nestjs/testing';
import { DeleteDiscoverSectionUseCase } from '../delete-discover-section.use-case';
import { setupMockDiscoverSectionRepository } from '../../../__mocks__/discover-section-repository.mock';
import { mockDiscoverSection } from '../../../__mocks__/discover-section.mocks';
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

describe('DeleteDiscoverSectionUseCase', () => {
  let useCase: DeleteDiscoverSectionUseCase;
  let discoverSectionRepository: DiscoverSectionRepositoryInterface;

  beforeEach(async () => {
    // Setup repository mock
    const mockRepo = setupMockDiscoverSectionRepository();

    const moduleRef = await Test.createTestingModule({
      providers: [
        DeleteDiscoverSectionUseCase,
        {
          provide: DiscoverSectionRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = moduleRef.get<DeleteDiscoverSectionUseCase>(
      DeleteDiscoverSectionUseCase,
    );
    discoverSectionRepository = moduleRef.get(DiscoverSectionRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a section successfully', async () => {
    const sectionId = 1;

    // Use arrow functions to avoid unbound method linter warnings
    const findByIdSpy = jest.spyOn(discoverSectionRepository, 'findById');
    findByIdSpy.mockResolvedValue(mockDiscoverSection);

    const deleteSpy = jest.spyOn(discoverSectionRepository, 'delete');
    deleteSpy.mockResolvedValue(undefined);

    // Execute the use case
    await useCase.execute(sectionId);

    // Verify repository methods were called correctly
    expect(findByIdSpy).toHaveBeenCalledWith(sectionId);
    expect(deleteSpy).toHaveBeenCalledWith(sectionId);
  });

  it('should throw NotFoundException when section does not exist', async () => {
    const nonExistentId = 999;

    // Use arrow functions to avoid unbound method linter warnings
    const findByIdSpy = jest.spyOn(discoverSectionRepository, 'findById');
    findByIdSpy.mockResolvedValue(null);

    const deleteSpy = jest.spyOn(discoverSectionRepository, 'delete');

    // Execute and expect an exception
    await expect(useCase.execute(nonExistentId)).rejects.toThrow(
      NotFoundException,
    );

    // Verify findById was called but delete was not
    expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
