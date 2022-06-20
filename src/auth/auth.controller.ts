import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCreatedResponse, ApiOperation, ApiTags }  from '@nestjs/swagger'
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({summary: "Signup new user"})
  @ApiCreatedResponse({description: "User created"})
  async signup(@Body() userData:SignupDto) {

  }

  @Post("signin")
  async signin(@Body() userData:SigninDto) {
    
  }

}
