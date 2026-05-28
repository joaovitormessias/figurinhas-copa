import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStickerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsInt()
  @Min(1)
  albumNumber: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  playerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  teamName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  collection: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}
