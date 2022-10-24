import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
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
import { UserService } from '../user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { User } from '../decorators/user.decorator';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import {
  ResetPasswordDto,
  VerifyResetPasswordDto,
} from './dto/reset-password.dto';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { WebsiteTemplate, VerifyStatus } from 'src/template/website';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly websiteTemplate: WebsiteTemplate,
  ) {}

  @Post('google')
  @ApiOperation({ summary: 'Authenticate with Google' })
  @ApiOkResponse({ description: 'Authenticate success' })
  @ApiBadRequestResponse({ description: 'Fail to authenticate' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async googleAuth(@Body() authData: GoogleAuthDto): Promise<AuthResponseDto> {
    try {
      const user = await this.authService.authWithGoogle(authData.token);
      if (!user) throw new BadRequestException('Fail to authenticate');
      const token = await this.authService.generateToken(user);
      return { token };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup new user' })
  @ApiCreatedResponse({ description: 'User created' })
  @ApiBadRequestResponse({ description: 'Email already exists' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async signup(@Body() authData: AuthDto): Promise<AuthResponseDto> {
    try {
      const existingUser = await this.userService.findUserByEmail(
        authData.email,
      );

      if (existingUser) throw new BadRequestException('User already exists');

      const hashPassword = await this.authService.hashPassword(
        authData.password,
      );

      const user = await this.authService.signup({
        ...authData,
        password: hashPassword,
      });

      if (user === null) throw new BadRequestException('Fail to create user');

      const token = await this.authService.generateToken(user);
      return {
        token,
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('signin')
  @ApiOperation({ summary: 'Signin existing user' })
  @ApiOkResponse({ description: 'User signed in' })
  @ApiBadRequestResponse({ description: 'Email or password is incorrect' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async signin(@Body() authData: AuthDto): Promise<AuthResponseDto> {
    try {
      const user = await this.authService.signin(authData);

      if (user === null)
        throw new BadRequestException('Email or password is incorrect');

      const token = await this.authService.generateToken(user);
      return {
        token,
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change Password' })
  @ApiOkResponse({ description: 'Change password successful' })
  @ApiBadRequestResponse({ description: 'Fail to change password' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  async changePassword(
    @User() userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      await this.authService.changePassword(userId, changePasswordDto);
      return {
        success: true,
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('resent-verify-email')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resent verify email' })
  @ApiOkResponse({ description: 'Email sent' })
  @ApiBadRequestResponse({ description: 'Email is not valid' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async resendVerifyEmail(
    @User() userId: string,
    @Query('userId') userIdQuery: string,
  ): Promise<any> {
    try {
      await this.authService.resendVerifyEmail(userId ?? userIdQuery);
      return {
        success: true,
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Reset password request' })
  @ApiOkResponse({ description: 'Password reset link sent' })
  @ApiBadRequestResponse({ description: 'Email not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async requestResetPassword(
    @Body() resetPasswordDto: RequestResetPasswordDto,
  ) {
    try {
      const result = await this.authService.requestResetPassword(
        resetPasswordDto.email,
      );
      return result;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('reset-password/verify')
  @ApiOperation({ summary: 'Reset password verify' })
  @ApiOkResponse({ description: 'Token is valid' })
  @ApiBadRequestResponse({ description: 'Token is invalid' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async verifyResetPasswordToken(
    @Body() resetPasswordDto: VerifyResetPasswordDto,
  ) {
    try {
      const tokenValid = await this.authService.verifyResetPasswordToken(
        resetPasswordDto,
      );
      if (!tokenValid) throw new BadRequestException('Token is invalid');
      return {
        success: true,
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({ description: 'Password reset' })
  @ApiBadRequestResponse({ description: 'Token is invalid' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const tokenValid = await this.authService.verifyResetPasswordToken(
        resetPasswordDto,
      );
      if (!tokenValid) throw new BadRequestException('Token is invalid');
      await this.authService.resetPassword(resetPasswordDto);
      return {
        success: true,
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiOkResponse({ description: 'Email is verified' })
  @ApiBadRequestResponse({ description: 'Token is invalid' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async verifyEmail(@Query('token') token: string): Promise<any> {
    try {
      const result = await this.authService.verifyEmail(token);
      return this.websiteTemplate.renderVerificationResultTemplate(
        VerifyStatus.VERIFY_SUCCESS,
        result.email,
      );
    } catch (error) {
      if (error.response) {
        switch (error.response.message) {
          case 'Token is invalid':
            return this.websiteTemplate.renderVerificationResultTemplate(
              VerifyStatus.TOKEN_INVALID,
            );
          case 'Email is already verified':
            return this.websiteTemplate.renderVerificationResultTemplate(
              VerifyStatus.ALREADY_VERIFIED,
            );
          case 'Token has expired':
            return this.websiteTemplate.renderVerificationResultTemplate(
              VerifyStatus.TOKEN_EXPIRED,
            );
          default:
            throw error;
        }
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Get Information Success' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiBadRequestResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getMeInfo(@User() userId: string): Promise<any> {
    try {
      const user = await this.userService.findUserById(userId);
      if (!user) throw new BadRequestException('User not found');
      return user;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
