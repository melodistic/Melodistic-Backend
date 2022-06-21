import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags }  from '@nestjs/swagger'
import { AuthDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @Post("signup")
  @ApiOperation({summary: "Signup new user"})
  @ApiCreatedResponse({description: "User created"})
  @ApiBadRequestResponse({description: "Email already exists"})
  async signup(@Body() authData:AuthDto) {
    const existingUser = await this.userService.findUserByEmail(authData.email);
    if(existingUser) throw new BadRequestException("User already exists");
    authData.password = await this.authService.hashPassword(authData.password);
    return this.authService.signup(authData); 
  }

  @Post("signin")
  @ApiOperation({summary: "Signin existing user"})
  @ApiCreatedResponse({description: "User signed in"})
  async signin(@Body() authData:AuthDto) {
    
  }

}
