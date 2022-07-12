import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserFavoriteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  track_id: string;
}
