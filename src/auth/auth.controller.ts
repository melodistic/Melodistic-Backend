import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { User } from 'src/decorators/user.decorator';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import {
  ResetPasswordDto,
  VerifyResetPasswordDto,
} from './dto/reset-password.dto';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('google')
  async googleAuth(@Body() authData: GoogleAuthDto): Promise<AuthResponseDto> {
    const user = await this.authService.authWithGoogle(authData.token);
    if (!user) throw new BadRequestException();
    const token = await this.authService.generateToken(user);
    return { token };
  }

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

  @Post('forget-password')
  @ApiOperation({ summary: 'Reset password request' })
  @ApiOkResponse({ description: 'Password reset link sent' })
  @ApiBadRequestResponse({ description: 'Email not found' })
  async requestResetPassword(
    @Body() resetPasswordDto: RequestResetPasswordDto,
  ) {
    try {
      return this.authService.requestResetPassword(resetPasswordDto.email);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({ description: 'Password reset' })
  @ApiBadRequestResponse({ description: 'Token is invalid' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      if (this.authService.verifyResetPasswordToken(resetPasswordDto)) {
        await this.authService.resetPassword(resetPasswordDto);
      }
      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Post('reset-password/verify')
  @ApiOperation({ summary: 'Reset password verify' })
  @ApiOkResponse({ description: 'Token is valid' })
  @ApiBadRequestResponse({ description: 'Token is invalid' })
  async verifyResetPasswordToken(
    @Body() resetPasswordDto: VerifyResetPasswordDto,
  ) {
    try {
      await this.authService.verifyResetPasswordToken(resetPasswordDto);
      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiOkResponse({ description: 'Email is verified' })
  @ApiBadRequestResponse({ description: 'Token is invalid' })
  async verifyEmail(@Query('token') token: string): Promise<any> {
    try {
      await this.authService.verifyEmail(token);
      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse()
  async getMeInfo(@User() userId: string) {
    return this.userService.findUserById(userId);
  }
}
