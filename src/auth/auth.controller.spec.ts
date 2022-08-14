import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { BadRequestException } from '@nestjs/common';

const mockData = {
  user: {
    user_id: '1',
    email: 'test@test.com',
    password: 'test',
    user_profile_image: 'test',
    exercise_duration_hour: 1,
    exercise_duration_minute: 0,
    created_at: new Date(),
    updated_at: new Date(),
    email_verification_token: 'randomToken',
    email_verification_token_expiry: new Date(),
    email_verified: false,
  },
  hashPassword: 'hashPassword',
  randomToken: 'randomToken',
  resetPasswordToken: 'resetPasswordToken',
  token: 'token'
};
jest.mock('./auth.service');
jest.mock('../user/user.service');
describe('Auth Controller', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UserService],
    }).compile();
    authController = moduleRef.get(AuthController);
    authService = moduleRef.get(AuthService);
    userService = moduleRef.get(UserService);
  });
  beforeEach(() => {
    jest
      .spyOn(authService, 'hashPassword')
      .mockResolvedValue(mockData.hashPassword);
    jest
      .spyOn(authService, 'generateRandomToken')
      .mockReturnValue(mockData.randomToken);
    jest
      .spyOn(authService, 'generateResetPasswordToken')
      .mockReturnValue(mockData.resetPasswordToken);
    jest.spyOn(authService, 'generateToken').mockResolvedValue(mockData.token);
    jest.spyOn(authService, 'verifyEmail').mockResolvedValue(true);
    jest
      .spyOn(authService, 'getVerifyEmailToken')
      .mockResolvedValue(mockData.randomToken);
    jest.spyOn(authService, 'resetPassword');
    jest.spyOn(authService, 'requestResetPassword').mockResolvedValue({
      email: mockData.user.email,
      token: mockData.resetPasswordToken,
    });
    jest.spyOn(userService, 'findUserById').mockResolvedValue(mockData.user);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('POST /auth/google should return token if authentication success', async () => {
    jest.spyOn(authService, 'authWithGoogle').mockResolvedValue(mockData.user);
    const authData = {
      token: 'token',
    };
    const result = await authController.googleAuth(authData);
    expect(authService.authWithGoogle).toHaveBeenCalledWith(authData.token);
    expect(authService.generateToken).toHaveBeenCalledWith(mockData.user);
    expect(result).toEqual({ token: mockData.token });
  });
  it('POST /auth/google should throw error if authenticate fail', async () => {
    jest.spyOn(authService, 'authWithGoogle').mockResolvedValue(null);
    const authData = {
      token: 'token',
    };
    await expect(authController.googleAuth(authData)).rejects.toThrow(
      new BadRequestException('Fail to authenticate'),
    );
  });
  it('POST /auth/signup should return token', async () => {
    jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
    jest.spyOn(authService, 'signup').mockResolvedValue(mockData.user);
    const authData = {
      email: 'test@test.com',
      password: 'test',
    };
    const result = await authController.signup(authData);
    expect(userService.findUserByEmail).toHaveBeenCalledWith(authData.email);
    expect(authService.hashPassword).toHaveBeenCalledWith(authData.password);
    expect(authService.signup).toHaveBeenCalledWith({
      ...authData,
      password: mockData.hashPassword,
    });
    expect(authService.generateToken).toHaveBeenCalledWith(mockData.user);
    expect(result).toEqual({ token: mockData.token });
  });
  it('POST /auth/signup should throw error if user exists', async () => {
    jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockData.user);
    jest.spyOn(authService, 'signup').mockResolvedValue(mockData.user);
    const authData = {
      email: 'test@test.com',
      password: 'test',
    };
    await expect(authController.signup(authData)).rejects.toThrow(
      new BadRequestException('User already exists'),
    )
  })
  it('POST /auth/signup should throw error if fail to create user', async () => {
    jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
    jest.spyOn(authService, 'signup').mockResolvedValue(null);
    const authData = {
      email: 'test@test.com',
      password: 'test',
    };
    await expect(authController.signup(authData)).rejects.toThrow(
      new BadRequestException('Fail to create user'),
    )
  })
  it('POST /auth/signin should return token', async () => {
    jest.spyOn(authService, 'signin').mockResolvedValue(mockData.user);
    const authData = {
      email: 'test@test.com',
      password: 'test',
    }
    const result = await authController.signin(authData);
    expect(authService.signin).toHaveBeenCalledWith(authData);
    expect(authService.generateToken).toHaveBeenCalledWith(mockData.user);
    expect(result).toEqual({ token: mockData.token });
  })
  it('POST /auth/signin should throw error if fail to authenticate', async () => {
    jest.spyOn(authService, 'signin').mockResolvedValue(null);
    const authData = {
      email: 'test@test.com',
      password: 'test',
    }
    await expect(authController.signin(authData)).rejects.toThrow(
      new BadRequestException('Email or password is incorrect'),
    );
  })
  it('POST /auth/forget-password should return email and token', async() => {
    const requestResetPasswordDto = {
      email: 'test@test.com',
    }
    const result = await authController.requestResetPassword(requestResetPasswordDto);
    expect(authService.requestResetPassword).toHaveBeenCalledWith(requestResetPasswordDto.email);
    expect(result).toEqual({
      email: mockData.user.email,
      token: mockData.resetPasswordToken,
    });
  })
  it('POST /auth/reset-password/verify should return success', async () => {
    jest.spyOn(authService, 'verifyResetPasswordToken').mockResolvedValue(true);
    const verifyResetPasswordDto = {
      email: 'test@test.com',
      token: mockData.resetPasswordToken,
    }
    const result = await authController.verifyResetPasswordToken(verifyResetPasswordDto);
    expect(authService.verifyResetPasswordToken).toHaveBeenCalledWith(verifyResetPasswordDto);
    expect(result).toEqual({
      success: true,
    });
  })
  it('POST /auth/reset-password/verify should throw error if token is invalid', async () => {
    jest.spyOn(authService, 'verifyResetPasswordToken').mockResolvedValue(false);
    const verifyResetPasswordDto = {
      email: 'test@test.com',
      token: mockData.resetPasswordToken,
    }
    await expect(authController.verifyResetPasswordToken(verifyResetPasswordDto)).rejects.toThrow(
      new BadRequestException('Token is invalid'),
    );
  })
  it('POST /auth/reset-password should return success', async () => {
    jest.spyOn(authService, 'verifyResetPasswordToken').mockResolvedValue(true);
    const resetPasswordDto = {
      email: 'test@test.com',
      token: mockData.resetPasswordToken,
      password: 'test',
    }
    const result = await authController.resetPassword(resetPasswordDto);
    expect(authService.verifyResetPasswordToken).toHaveBeenCalledWith(resetPasswordDto);
    expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    expect(result).toEqual({
      success: true
    });
  })
  it('POST /auth/reset-password should throw error if token is invalid', async () => {
    jest.spyOn(authService, 'verifyResetPasswordToken').mockResolvedValue(false);
    const resetPasswordDto = {
      email: 'test@test.com',
      token: mockData.resetPasswordToken,
      password: 'test',
    }
    await expect(authController.resetPassword(resetPasswordDto)).rejects.toThrow(
      new BadRequestException('Token is invalid'),
    );
  })
  it('POST /auth/verify should return success', async () => {
    const result = await authController.verifyEmail(mockData.randomToken);
    expect(authService.verifyEmail).toHaveBeenCalledWith(mockData.randomToken);
    expect(result).toEqual({
      success: true
    });
  })
  it('GET /auth/me should return user', async() => {
    const result = await authController.getMeInfo(mockData.user.user_id);
    expect(userService.findUserById).toHaveBeenCalledWith(mockData.user.user_id);
    expect(result).toEqual(mockData.user);
  })
});
