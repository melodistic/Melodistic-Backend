import { ApiProperty } from "@nestjs/swagger";

export class GoogleAuthDto {
    
    @ApiProperty()
    token: string
    
}