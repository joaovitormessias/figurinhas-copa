import { AdminStockStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAdminStockDto {
  // TODO: Replace body actorUserId with CurrentUser when authentication is implemented.
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsUUID()
  stickerId: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reservedQuantity?: number;

  @IsNumber()
  @Min(0)
  salePrice: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsEnum(AdminStockStatus)
  status?: AdminStockStatus;
}
