import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class OfferActionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  adminFinalPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
