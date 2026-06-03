import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CancelOrderByUserDto {
  // TODO: Replace body userId with CurrentUser when authentication is implemented.
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cancellationReason?: string;
}

export class CancelOrderByAdminDto {
  // TODO: Replace body actorUserId with CurrentUser when authentication is implemented.
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cancellationReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
