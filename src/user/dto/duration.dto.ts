import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserDurationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  duration_hour: number;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  duration_minute: number;
}
