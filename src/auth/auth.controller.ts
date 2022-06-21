import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
  async signup(@Body() authData: AuthDto): Promise<AuthResponseDto> {
    try {
      const existingUser = await this.userService.findUserByEmail(
        authData.email,
      );

      if (existingUser) throw new BadRequestException('User already exists');

      authData.password = await this.authService.hashPassword(
        authData.password,
      );

      const user = await this.authService.signup(authData);

      if (user === null) throw new BadRequestException();

      const token = await this.authService.generateToken(user);
      return {
        token,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  @Post('signin')
  @ApiOperation({ summary: 'Signin existing user' })
  @ApiCreatedResponse({ description: 'User signed in' })
  @ApiBadRequestResponse({ description: 'Email or password is incorrect' })
  async signin(@Body() authData: AuthDto): Promise<AuthResponseDto> {
    try {
      const user = await this.authService.signin(authData);

      if (user === null) throw new BadRequestException();

      const token = await this.authService.generateToken(user);
      return {
        token,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMeInfo(userId: string) {
    return this.userService.findUserById(userId);
  }
}
