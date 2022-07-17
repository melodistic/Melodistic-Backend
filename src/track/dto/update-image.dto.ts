import { ApiProperty } from "@nestjs/swagger";

export class UpdateImageDto {
    @ApiProperty({type: 'string', format: 'binary'})
    program_image: string;
}