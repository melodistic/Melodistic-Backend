import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Mood, MuscleGroup, SectionType } from '../../schema/track.schema';

export class Section {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  section_name: string;

  @ApiProperty({ enum: SectionType })
  @IsEnum(SectionType)
  @IsNotEmpty()
  section_type: SectionType;

  @ApiProperty({ enum: Mood })
  @IsEnum(Mood)
  @IsNotEmpty()
  mood: Mood;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  duration: number;

  @ApiProperty()
  @IsArray()
  music_ids: [string];
}

export class CreateTrackDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  program_name: string;

  @ApiProperty({ enum: MuscleGroup })
  @IsEnum(MuscleGroup)
  @IsNotEmpty()
  muscle_group: MuscleGroup;

  @ApiProperty({ type: [Section] })
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  sections: [Section];
}
