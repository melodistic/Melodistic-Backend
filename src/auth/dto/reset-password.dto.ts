import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyResetPasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    token: string;
}

export class ResetPasswordDto extends VerifyResetPasswordDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

}