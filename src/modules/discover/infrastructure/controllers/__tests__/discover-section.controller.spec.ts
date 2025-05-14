import { Test, TestingModule } from '@nestjs/testing';
import { DiscoverSectionController } from '../discover-section.controller';
import { CreateDiscoverSectionUseCase } from '../../../application/use-cases/create-discover-section.use-case';
import { GetAllDiscoverSectionsUseCase } from '../../../application/use-cases/get-all-discover-sections.use-case';
import { GetDiscoverSectionUseCase } from '../../../application/use-cases/get-discover-section.use-case';
import { UpdateDiscoverSectionUseCase } from '../../../application/use-cases/update-discover-section.use-case';
import { DeleteDiscoverSectionUseCase } from '../../../application/use-cases/delete-discover-section.use-case';
import { mockDiscoverSectionResponse } from '../../../__mocks__/discover-section.mocks';
import { CreateDiscoverSectionDto } from '../../../application/dtos/create-discover-section.dto';
import { UpdateDiscoverSectionDto } from '../../../application/dtos/update-discover-section.dto';
import { SectionType } from '../../../domain/entities/discover-section.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('DiscoverSectionController', () => {
  let controller: DiscoverSectionController;
  let createDiscoverSectionUseCase: CreateDiscoverSectionUseCase;
  let getAllDiscoverSectionsUseCase: GetAllDiscoverSectionsUseCase;
  let getDiscoverSectionUseCase: GetDiscoverSectionUseCase;
  let updateDiscoverSectionUseCase: UpdateDiscoverSectionUseCase;
  let deleteDiscoverSectionUseCase: DeleteDiscoverSectionUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscoverSectionController],
      providers: [
        {
          provide: CreateDiscoverSectionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAllDiscoverSectionsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetDiscoverSectionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateDiscoverSectionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteDiscoverSectionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiscoverSectionController>(
      DiscoverSectionController,
    );
    createDiscoverSectionUseCase = module.get<CreateDiscoverSectionUseCase>(
      CreateDiscoverSectionUseCase,
    );
    getAllDiscoverSectionsUseCase = module.get<GetAllDiscoverSectionsUseCase>(
      GetAllDiscoverSectionsUseCase,
    );
    getDiscoverSectionUseCase = module.get<GetDiscoverSectionUseCase>(
      GetDiscoverSectionUseCase,
    );
    updateDiscoverSectionUseCase = module.get<UpdateDiscoverSectionUseCase>(
      UpdateDiscoverSectionUseCase,
    );
    deleteDiscoverSectionUseCase = module.get<DeleteDiscoverSectionUseCase>(
      DeleteDiscoverSectionUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDiscoverSection', () => {
    it('should create a new discover section', async () => {
      const createDto: CreateDiscoverSectionDto = {
        title: 'Test Section',
        slug: 'test-section',
        type: SectionType.PRODUCTS,
        queryConfig: { maxItems: 5 },
        isActive: true,
        priority: 10,
      };

      jest
        .spyOn(createDiscoverSectionUseCase, 'execute')
        .mockResolvedValue(mockDiscoverSectionResponse);

      const result = await controller.createDiscoverSection(createDto);

      expect(createDiscoverSectionUseCase.execute).toHaveBeenCalledWith(
        createDto,
      );
      expect(result).toEqual(mockDiscoverSectionResponse);
    });

    it('should handle errors when creating a section', async () => {
      const createDto: CreateDiscoverSectionDto = {
        title: 'Test Section',
        slug: 'test-section',
        type: SectionType.PRODUCTS,
        queryConfig: { maxItems: 5 },
        isActive: true,
        priority: 10,
      };

      const error = new HttpException(
        'Error creating section',
        HttpStatus.BAD_REQUEST,
      );
      jest
        .spyOn(createDiscoverSectionUseCase, 'execute')
        .mockRejectedValue(error);

      await expect(controller.createDiscoverSection(createDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getAllDiscoverSections', () => {
    it('should return all discover sections', async () => {
      const mockSections = [mockDiscoverSectionResponse];

      jest
        .spyOn(getAllDiscoverSectionsUseCase, 'execute')
        .mockResolvedValue(mockSections);

      const result = await controller.getAllDiscoverSections();

      expect(getAllDiscoverSectionsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockSections);
    });
  });

  describe('getDiscoverSectionById', () => {
    it('should return a discover section by id', async () => {
      const sectionId = 1;

      jest
        .spyOn(getDiscoverSectionUseCase, 'execute')
        .mockResolvedValue(mockDiscoverSectionResponse);

      const result = await controller.getDiscoverSectionById(sectionId);

      expect(getDiscoverSectionUseCase.execute).toHaveBeenCalledWith(sectionId);
      expect(result).toEqual(mockDiscoverSectionResponse);
    });

    it('should handle not found errors', async () => {
      const sectionId = 999;

      const error = new HttpException(
        'Section not found',
        HttpStatus.NOT_FOUND,
      );
      jest.spyOn(getDiscoverSectionUseCase, 'execute').mockRejectedValue(error);

      await expect(
        controller.getDiscoverSectionById(sectionId),
      ).rejects.toThrow(error);
    });
  });

  describe('updateDiscoverSection', () => {
    it('should update a discover section', async () => {
      const sectionId = 1;
      const updateDto: UpdateDiscoverSectionDto = {
        title: 'Updated Section',
        isActive: false,
      };

      const updatedSection = {
        ...mockDiscoverSectionResponse,
        title: 'Updated Section',
        isActive: false,
      };

      jest
        .spyOn(updateDiscoverSectionUseCase, 'execute')
        .mockResolvedValue(updatedSection);

      const result = await controller.updateDiscoverSection(
        sectionId,
        updateDto,
      );

      expect(updateDiscoverSectionUseCase.execute).toHaveBeenCalledWith(
        sectionId,
        updateDto,
      );
      expect(result).toEqual(updatedSection);
    });

    it('should handle errors when updating', async () => {
      const sectionId = 1;
      const updateDto: UpdateDiscoverSectionDto = {
        title: 'Updated Section',
      };

      const error = new HttpException(
        'Error updating section',
        HttpStatus.BAD_REQUEST,
      );
      jest
        .spyOn(updateDiscoverSectionUseCase, 'execute')
        .mockRejectedValue(error);

      await expect(
        controller.updateDiscoverSection(sectionId, updateDto),
      ).rejects.toThrow(error);
    });
  });

  describe('deleteDiscoverSection', () => {
    it('should delete a discover section', async () => {
      const sectionId = 1;

      jest
        .spyOn(deleteDiscoverSectionUseCase, 'execute')
        .mockResolvedValue(undefined);

      await controller.deleteDiscoverSection(sectionId);

      expect(deleteDiscoverSectionUseCase.execute).toHaveBeenCalledWith(
        sectionId,
      );
    });

    it('should handle not found errors when deleting', async () => {
      const sectionId = 999;

      const error = new HttpException(
        'Section not found',
        HttpStatus.NOT_FOUND,
      );
      jest
        .spyOn(deleteDiscoverSectionUseCase, 'execute')
        .mockRejectedValue(error);

      await expect(controller.deleteDiscoverSection(sectionId)).rejects.toThrow(
        error,
      );
    });
  });
});
