import { IsBoolean } from 'class-validator';

export class UpdateInventoryVisibilityDto {
  @IsBoolean()
  isVisible: boolean;
}
