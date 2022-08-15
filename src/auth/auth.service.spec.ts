import { BadRequestException, CACHE_MANAGER } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { MailService } from '../utils/mail.service';
import { PrismaService } from '../prisma.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
const mockData = {
  user: {
    user_id: '1',
    email: 'test@test.com',
    password: null,
    user_profile_image: null,
    exercise_duration_hour: null,
    exercise_duration_minute: null,
    created_at: null,
    updated_at: null,
    email_verification_token: 'mockVerifyToken',
    email_verification_token_expiry: new Date(new Date().getTime() + 3600000),
    email_verified: false,
  },
  authData: {
    email: 'test@test.com',
    password: 'test',
  },
};
jest.mock('googleapis', () => {
  return {
    Auth: {
      OAuth2Client: {
        getTokenInfo: jest.fn().mockResolvedValue({
          email: 'mockEmail',
        }),
      },
    },
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => {
          return {
            getTokenInfo: jest.fn().mockResolvedValue({
              email: 'mockEmail',
            }),
          };
        }),
      },
    },
  };
});
jest.mock('cache-manager', () => {
  return {
    set: jest.fn(),
    get: jest.fn(),
  };
});
describe('Auth Service', () => {
  let authService: AuthService;
  let mailService: MailService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let cacheManager: Cache;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        MailService,
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SENDGRID_API_KEY') {
                return 'SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
              }
              return 'mockENVValue';
            }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            get: jest.fn().mockReturnValue('mockCacheValue'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mockToken'),
          },
        },
      ],
    }).compile();
    authService = moduleRef.get(AuthService);
    mailService = moduleRef.get(MailService);
    prismaService = moduleRef.get(PrismaService);
    jwtService = moduleRef.get(JwtService);
    cacheManager = moduleRef.get(CACHE_MANAGER);
  });
  beforeEach(() => {
    jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockData.user);
  });
  it('hashPassword should return a hashed password', async () => {
    const password = 'test';
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashPassword');
    const hashedPassword = await authService.hashPassword(password);
    expect(hashedPassword).toEqual('hashPassword');
  });
  it('generateRandomToken should return random string', async () => {
    const token = authService.generateRandomToken();
    expect(token).toBeDefined();
  });
  it('generateResetPasswordToken should return random string', async () => {
    const token = authService.generateResetPasswordToken();
    expect(token).toBeDefined();
    expect(token).toHaveLength(6);
  });
  it('generateToken should return a token', async () => {
    const token = await authService.generateToken(mockData.user);
    expect(token).toBeDefined();
    expect(token).toEqual('mockToken');
  });
  it('authWithGoogle should return a user if user exists', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    const user = await authService.authWithGoogle('mockToken');
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(prismaService.user.create).not.toHaveBeenCalled();
    expect(user).toEqual(mockData.user);
  });
  it('authWithGoogle should create and return a user if user does not exist', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
    const user = await authService.authWithGoogle('mockToken');
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(prismaService.user.create).toHaveBeenCalled();
    expect(user).toEqual(mockData.user);
  });
  it('authWithGoogle should return null if something went wrong', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockRejectedValue(null);
    const user = await authService.authWithGoogle('mockToken');
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(user).toBeNull();
  });
  it('signup should return user', async () => {
    jest.spyOn(authService, 'generateRandomToken').mockReturnValue('mockToken');
    jest
      .spyOn(mailService, 'sendEmail')
      .mockImplementation(
        async (to: string, subject: string, html: string) => {},
      );
    const user = await authService.signup(mockData.authData);
    expect(mailService.sendEmail).toHaveBeenCalled();
    expect(authService.generateRandomToken).toHaveBeenCalled();
    expect(user).toEqual(mockData.user);
  });
  it('signup should return null if something went wrong', async () => {
    jest.spyOn(authService, 'generateRandomToken').mockImplementation(() => {
      throw new Error();
    });
    const user = await authService.signup(mockData.authData);
    expect(authService.generateRandomToken).toHaveBeenCalled();
    expect(user).toBeNull();
  });
  it('signin should return user', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    const user = await authService.signin(mockData.authData);
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalled();
    expect(user).toEqual(mockData.user);
  });
  it('signin should return null if not found user', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
    const user = await authService.signin(mockData.authData);
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(user).toBeNull();
  });
  it('signin should return null if password is wrong', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    const user = await authService.signin(mockData.authData);
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalled();
    expect(user).toBeNull();
  });
  it('signin should return null if something went wrong', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockRejectedValue(null);
    const user = await authService.signin(mockData.authData);
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(user).toBeNull();
  });
  it('requestResetPassword should return email and token', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    jest
      .spyOn(authService, 'generateResetPasswordToken')
      .mockReturnValue('mockToken');
    jest
      .spyOn(mailService, 'sendEmail')
      .mockImplementation(
        async (to: string, subject: string, html: string) => {},
      );
    const { email, token } = await authService.requestResetPassword(
      mockData.authData.email,
    );
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(cacheManager.set).toHaveBeenCalled();
    expect(authService.generateResetPasswordToken).toHaveBeenCalled();
    expect(mailService.sendEmail).toHaveBeenCalled();
    expect(email).toEqual(mockData.user.email);
    expect(token).toEqual('mockToken');
  });
  it('requestResetPassword should throw error if email not found', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
    await expect(
      authService.requestResetPassword(mockData.authData.email),
    ).rejects.toThrow(new BadRequestException('Email not found'));
  });
  it('resetPassword should success', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    jest.spyOn(authService, 'hashPassword').mockResolvedValue('mockToken');
    jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockData.user);
    await authService.resetPassword({
      email: mockData.authData.email,
      password: 'mockPassword',
      token: 'mockToken',
    });
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(authService.hashPassword).toHaveBeenCalled();
    expect(prismaService.user.update).toHaveBeenCalled();
  });
  it('verifyResetPasswordToken should return true if resetToken match', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    jest.spyOn(cacheManager, 'get').mockResolvedValue('mockToken');
    const result = await authService.verifyResetPasswordToken({
      email: mockData.authData.email,
      token: 'mockToken',
    });
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(cacheManager.get).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
  it('verifyResetPasswordToken should return false if resetToken is not match', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    jest.spyOn(cacheManager, 'get').mockResolvedValue('mockToken');
    const result = await authService.verifyResetPasswordToken({
      email: mockData.authData.email,
      token: 'mockToken 1',
    });
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(cacheManager.get).toHaveBeenCalled();
    expect(result).toBeFalsy();
  });
  it('getVerifyEmailToken should return email token', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    const result = await authService.getVerifyEmailToken(
      mockData.authData.email,
    );
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(result).toEqual('mockVerifyToken');
  });
  it('getVerifyEmailToken should throw error if user not found', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
    await expect(
      authService.getVerifyEmailToken(mockData.authData.email),
    ).rejects.toThrow(new BadRequestException('User not found'));
  });
  it('verifyEmail should return true', async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockData.user);
    const result = await authService.verifyEmail('mockVerifyToken');
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(prismaService.user.update).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
  it('verifyEmail should throw error if token is invalid', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
    await expect(authService.verifyEmail('mockVerifyToken')).rejects.toThrow(
      new BadRequestException('Token is invalid'),
    );
  });
  it('verifyEmail should throw error if already verify', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
      ...mockData.user,
      email_verified: true,
    });
    await expect(authService.verifyEmail('mockVerifyToken')).rejects.toThrow(
      new BadRequestException('Email is already verified'),
    );
  });
  it('verifyEmail should throw error if token expire', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
      ...mockData.user,
      email_verification_token_expiry: new Date(new Date().getTime() - 360000),
    });
    await expect(authService.verifyEmail('mockVerifyToken')).rejects.toThrow(
      new BadRequestException('Token has expired'),
    );
  });
});
