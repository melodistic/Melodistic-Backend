import { Test } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { UserModule } from '../src/user/user.module';
import { PrismaService } from '../src/prisma.service';
import { MailService } from '../src/utils/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentVariable } from '../src/config/env.types';
import { CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { RequestResetPasswordDto } from '../src/auth/dto/request-reset-password.dto';
import { ResetPasswordDto, VerifyResetPasswordDto } from '../src/auth/dto/reset-password.dto';

describe('Auth Controller', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtStrategy: JwtStrategy;
  let prismaService: PrismaService;
  let mailService: MailService;
  let configService: ConfigService<EnvironmentVariable>;

  const userEmail = 'test@test.com';
  const userPassword = 'test';
  const userNewPassword = 'thisisnewpassword'
  let verifyEmailToken = '';
  let resetPasswordToken = '';
  beforeAll(async () => {
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
    verifyEmailToken = await authService.getVerifyEmailToken(userEmail);
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
  it('Verify Email Successfully', async () => {
    const value = await authController.verifyEmail(verifyEmailToken);
    expect(value.success).toBeTruthy()
  })
  it('Verify Email Fail because of token not correct', () => {
    expect(async() => {
      await authController.verifyEmail('123456')
    }).rejects.toThrow();
  })
  it('Verify Email Fail because of email is already verified', async () => {
    expect(async() => {
      await authController.verifyEmail(verifyEmailToken)
    }).rejects.toThrow();
  })
  it('Forget Password should return token', async () =>  {
    const dto = new RequestResetPasswordDto();
    dto.email = userEmail;
    const value = await authController.requestResetPassword(dto);
    expect(value).toHaveProperty('token');
    resetPasswordToken = value.token;
  })
  it('Forget Password should throw error because of email not exists', async () =>  {
    const dto = new RequestResetPasswordDto();
    dto.email = 'someEmail@email.com'
    expect(async () => {
      await authController.requestResetPassword(dto);
    }).rejects.toThrow();
  })
  it('Token from forget password should be valid', async () =>  {
    const dto = new VerifyResetPasswordDto();
    dto.email = userEmail;
    dto.token = resetPasswordToken;
    const value = await authController.verifyResetPasswordToken(dto);
    expect(value.success).toBeTruthy();
  })
  it('Random token should be invalid', async() => {
    const dto = new VerifyResetPasswordDto();
    dto.email = userEmail;
    dto.token = '123456';
    expect(async () => {
      await authController.verifyResetPasswordToken(dto)
    }).rejects.toThrow();
  })
  it('Reset Password should be success when token is valid', async() => {
    const dto = new ResetPasswordDto();
    dto.email = userEmail;
    dto.token = resetPasswordToken;
    dto.password = userNewPassword;
    const value = await authController.resetPassword(dto);
    expect(value.success).toBeTruthy();
  })
  it('Reset Password should be fail when token is invalid', async() => {
    const dto = new ResetPasswordDto();
    dto.email = userEmail;
    dto.token = '123456';
    dto.password = userNewPassword;
    expect(async () => {
      await authController.resetPassword(dto)
    }).rejects.toThrow();
  })

  afterAll(async () => {
    await prismaService.user.deleteMany({
      where: {
        email: userEmail,
      },
    });
  });
});
