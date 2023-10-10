import { ApiProperty } from '@nestjs/swagger';

export class SignOutDto {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;
}