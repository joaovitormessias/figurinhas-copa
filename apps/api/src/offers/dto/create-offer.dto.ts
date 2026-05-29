import { StickerCondition } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  // TODO: Replace body userId with CurrentUser when authentication is implemented.
  @IsUUID()
  userId: string;

  @IsUUID()
  stickerId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(StickerCondition)
  condition: StickerCondition;

  @IsOptional()
  @IsNumber()
  @Min(0)
  suggestedPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  userNote?: string;
}
