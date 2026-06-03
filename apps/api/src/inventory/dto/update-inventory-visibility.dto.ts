import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateInventoryVisibilityDto {
  // TODO: Replace body actorUserId with CurrentUser when authentication is implemented.
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsBoolean()
  isVisible: boolean;
}
