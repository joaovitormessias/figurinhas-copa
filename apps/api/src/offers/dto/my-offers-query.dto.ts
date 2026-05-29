import { IsUUID } from 'class-validator';

export class MyOffersQueryDto {
  // TODO: Replace query userId with CurrentUser when authentication is implemented.
  @IsUUID()
  userId: string;
}
