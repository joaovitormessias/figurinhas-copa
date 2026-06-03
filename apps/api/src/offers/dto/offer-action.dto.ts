import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class OfferActionDto {
  // TODO: Replace body actorUserId with CurrentUser when authentication is implemented.
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adminFinalPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
