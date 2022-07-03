import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma.service';
import { MailService } from '../utils/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentVariable } from '../config/env.types';
import { CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { Cache } from 'cache-manager';
import { AuthDto } from './dto/auth.dto';

describe('Auth Controller', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtStrategy: JwtStrategy;
  let prismaService: PrismaService;
  let mailService: MailService;
  let configService: ConfigService<EnvironmentVariable>;

  const userEmail = 'test@test.com';
  const userPassword = 'test';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UserModule,
        ConfigModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
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
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, PrismaService, JwtStrategy, MailService],
    }).compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
    jwtStrategy = module.get(JwtStrategy);
    prismaService = module.get(PrismaService);
    mailService = module.get(MailService);
    configService = module.get(ConfigService);
  });

  it('Register User Successfully', async () => {
    const dto = new AuthDto();
    dto.email = userEmail;
    dto.password = userPassword;
    const value = await authController.signup(dto);
    expect(value).toHaveProperty('token');
  });
  it('Register User Fail because of email already exists', () => {
    const dto = new AuthDto();
    dto.email = userEmail;
    dto.password = userPassword;
    expect(async () => {
      await authController.signup(dto);
    }).rejects.toThrow();
  });
  it('Login User Successfully', async () => {
    const dto = new AuthDto();
    dto.email = userEmail;
    dto.password = userPassword;
    const value = await authController.signin(dto);
    expect(value).toHaveProperty('token');
  });
  it('Login User Fail because of email not exists', () => {
    const dto = new AuthDto();
    dto.email = 'someEmail@email.com';
    dto.password = userPassword;
    expect(async () => {
      await authController.signin(dto);
    }).rejects.toThrow();
  });
  it('Login User Fail because of password not correct', () => {
    const dto = new AuthDto();
    dto.email = userEmail;
    dto.password = 'somePassword';
    expect(async () => {
      await authController.signin(dto);
    }).rejects.toThrow();
  });
  afterAll(async () => {
    await prismaService.user.deleteMany({
      where: {
        email: userEmail,
      },
    });
  });
});
