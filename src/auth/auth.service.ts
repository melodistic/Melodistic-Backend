import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async generateToken(user: User): Promise<string> {
    return await this.jwtService.signAsync({ id: user.user_id });
  }

  async signup(authData: AuthDto): Promise<User | null> {
    try {
      const user = this.prisma.user.create({
        data: {
          email: authData.email,
          password: authData.password,
        },
      });
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
}
