import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
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
    return null;
  }
}
