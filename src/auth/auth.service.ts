import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Auth, google } from 'googleapis';
import { randomBytes } from 'crypto';
import { Cache } from 'cache-manager';
import {
  ResetPasswordDto,
  VerifyResetPasswordDto,
} from './dto/reset-password.dto';
import { MailService } from '../utils/mail.service';
import { EmailTemplate } from '../template/email';

@Injectable()
export class AuthService {
  private oauthClient: Auth.OAuth2Client;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private emailTemplate: EmailTemplate,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.oauthClient = new google.auth.OAuth2(clientId, clientSecret);
  }

  async hashPassword(password: string): Promise<string> {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  }

  generateRandomToken(): string {
    const token = randomBytes(32).toString('hex');
    return token;
  }

  generateResetPasswordToken(): string {
    return Math.random().toString().substring(2, 8);
  }

  async generateToken(user: User): Promise<string> {
    return await this.jwtService.signAsync({ id: user.user_id });
  }

  async authWithGoogle(token: string): Promise<User | null> {
    try {
      const tokenInfo = await this.oauthClient.getTokenInfo(token);

      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: tokenInfo.email,
        },
      });
      if (!existingUser) {
        const user = this.prisma.user.create({
          data: {
            email: tokenInfo.email,
            email_verified: true,
          },
        });
        return user;
      }
      return existingUser;
    } catch (error) {
      return null;
    }
  }

  async signup(authData: AuthDto): Promise<User | null> {
    try {
      const token = this.generateRandomToken();
      const user = this.prisma.user.create({
        data: {
          email: authData.email,
          password: authData.password,
          email_verification_token: token,
          email_verification_token_expiry: new Date(Date.now() + 3600000),
        },
      });
      const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000';
      await this.mailService.sendEmail(authData.email, "Please verify your email",this.emailTemplate.renderVerifyEmailTemplate(authData.email,`${API_ENDPOINT}/api/auth/verify?token=${token}`));

      return user;
    } catch (error) {
      return null;
    }
  }

  async signin(authData: AuthDto): Promise<User | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: authData.email,
        },
      });
      if (!user) return null;
      const isValid = await bcrypt.compare(authData.password, user.password);
      if (!isValid) return null;
      return user;
    } catch (error) {
      return null;
    }
  }

  async requestResetPassword(email: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) throw new BadRequestException('Email not found');
    const token = this.generateResetPasswordToken();
    await this.cacheManager.set(user.user_id, token, { ttl: 300 });
    await this.mailService.sendEmail(email, "OTP Verify Password", this.emailTemplate.renderOTPVerifyEmailTemplate(token));
    return { email, token };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: resetPasswordDto.email,
      },
    });
    const hashedPassword = await this.hashPassword(resetPasswordDto.password);
    await this.prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async verifyResetPasswordToken(
    resetPasswordDto: VerifyResetPasswordDto,
  ): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: resetPasswordDto.email,
      },
    });
    const resetToken = await this.cacheManager.get(user.user_id);
    return resetToken === resetPasswordDto.token;
  }

  async getVerifyEmailToken(email: string): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) throw new BadRequestException('User not found');
    return user.email_verification_token;
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email_verification_token: token,
        },
      });
      if (!existingUser) throw new BadRequestException('Token is invalid');
      if (existingUser.email_verified)
        throw new BadRequestException('Email is already verified');
      if (existingUser.email_verification_token_expiry < new Date())
        throw new BadRequestException('Token has expired');
      await this.prisma.user.update({
        data: {
          email_verified: true,
          email_verification_token: null,
          email_verification_token_expiry: null,
        },
        where: {
          email_verification_token: token,
        },
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
}
