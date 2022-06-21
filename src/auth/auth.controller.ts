import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Signup new user' })
  @ApiCreatedResponse({ description: 'User created' })
  @ApiBadRequestResponse({ description: 'Email already exists' })
  async signup(@Body() authData: AuthDto): Promise<AuthResponseDto | null> {
    const existingUser = await this.userService.findUserByEmail(authData.email);
    if (existingUser) throw new BadRequestException('User already exists');
    authData.password = await this.authService.hashPassword(authData.password);
    const user = await this.authService.signup(authData);
    if (user)
      return {
        userId: user.user_id,
      };
    return null;
  }

  @Post('signin')
  @ApiOperation({ summary: 'Signin existing user' })
  @ApiCreatedResponse({ description: 'User signed in' })
  async signin(@Body() authData: AuthDto): Promise<AuthResponseDto | null> {
    const user = await this.authService.signin(authData);
    if (user)
      return {
        userId: user.user_id,
      };
    return null;
  }
}
