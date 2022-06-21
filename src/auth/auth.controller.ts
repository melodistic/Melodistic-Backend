import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCreatedResponse, ApiOperation, ApiTags }  from '@nestjs/swagger'
import { AuthDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({summary: "Signup new user"})
  @ApiCreatedResponse({description: "User created"})
  async signup(@Body() authData:AuthDto) {
    authData.password = await this.authService.hashPassword(authData.password);
    return this.authService.signup(authData); 
  }

  @Post("signin")
  @ApiOperation({summary: "Signin existing user"})
  @ApiCreatedResponse({description: "User signed in"})
  async signin(@Body() authData:AuthDto) {
    
  }

}
