import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateStickerDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  albumNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  playerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  teamName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  collection?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}
