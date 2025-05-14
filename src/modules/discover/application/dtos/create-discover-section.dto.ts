import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Matches,
  IsObject,
} from 'class-validator';
import { SectionType } from '../../domain/entities/discover-section.entity';
import { Type } from 'class-transformer';

export class CreateDiscoverSectionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase, use hyphens, and contain no special characters',
  })
  slug: string;

  @IsNotEmpty()
  @IsEnum(SectionType)
  type: SectionType;

  @IsOptional()
  @IsObject()
  queryConfig?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priority?: number;
}
