import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AuthResponseDto {
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    token: string
    
}