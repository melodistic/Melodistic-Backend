import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentVariable } from 'src/config/env.types';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import * as redisStore from 'cache-manager-redis-store';
import { MailService } from 'src/utils/mail.service';

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
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 300,
      options: {
        password: process.env.REDIS_PASSWORD,
      },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, MailService],
})
export class AuthModule {}
