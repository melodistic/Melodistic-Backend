import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentVariable } from 'src/config/env.types';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: async (
        configService: ConfigService<EnvironmentVariable>,
      ) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: { algorithm: 'HS512' },
        verifyOptions: { algorithms: ['HS512'] },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}
