import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class OrderActionDto {
  // TODO: Replace body actorUserId with CurrentUser when authentication is implemented.
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
