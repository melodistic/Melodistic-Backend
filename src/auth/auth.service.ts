import { CACHE_MANAGER, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Auth, google } from 'googleapis';
import { randomBytes } from 'crypto';
import { Cache } from 'cache-manager';
import { ResetPasswordDto, VerifyResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class AuthService {
  private oauthClient: Auth.OAuth2Client;
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache , private prisma: PrismaService, private jwtService: JwtService) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.oauthClient = new google.auth.OAuth2(clientId, clientSecret);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
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
      console.log(tokenInfo);

      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: tokenInfo.email,
        },
      });
      if (!existingUser) {
        const user = this.prisma.user.create({
          data: {
            email: tokenInfo.email,
          },
        });
        return user;
      }
      return existingUser;
    } catch (error) {
      console.log(error);
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

      return user;
    } catch (error) {
      return null;
    }
  }

  async requestResetPassword(email: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      }});
    if (!user) throw new Error('User not found');
    const token = this.generateResetPasswordToken();
    await this.cacheManager.set(user.user_id, token, { ttl: 300 });
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

  async verifyResetPasswordToken(resetPasswordDto: VerifyResetPasswordDto): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: resetPasswordDto.email,
      }});
    const resetToken = await this.cacheManager.get(user.user_id);
    if(resetToken !== resetPasswordDto.token) throw new Error('Token is invalid');
    return true;
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

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email_verification_token: token,
        },
      });
      if (!existingUser) throw new Error('Token is invalid');
      if (existingUser.email_verified)
        throw new Error('Email is already verified');
      if (existingUser.email_verification_token_expiry < new Date())
        throw new Error('Token has expired');
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
