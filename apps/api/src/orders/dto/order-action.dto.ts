import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OrderActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
