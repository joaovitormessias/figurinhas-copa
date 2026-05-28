import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ListStickersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
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
}
