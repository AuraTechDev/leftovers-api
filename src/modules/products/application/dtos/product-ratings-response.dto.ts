export class ProductRatingUserDto {
  id: number;
  name: string;
}

export class ProductRatingItemDto {
  id: number;
  userId: number;
  user: ProductRatingUserDto;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export class ProductRatingsResponseDto {
  average: number;
  count: number;
  ratings: ProductRatingItemDto[];
}
