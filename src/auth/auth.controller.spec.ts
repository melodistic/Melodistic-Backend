import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailService } from '@sendgrid/mail';
import { EmailTemplate } from '../template/email';
import { WebsiteTemplate } from '../template/website';

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
  token: 'token',
};
jest.mock('./auth.service');
jest.mock('../user/user.service');
describe('Auth Controller', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let mailService: MailService;
  let emailTemplate: EmailTemplate;
  let websiteTemplate: WebsiteTemplate;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        MailService,
        EmailTemplate,
        WebsiteTemplate,
      ],
    }).compile();
    authController = moduleRef.get(AuthController);
    authService = moduleRef.get(AuthService);
    userService = moduleRef.get(UserService);
    mailService = moduleRef.get(MailService);
    emailTemplate = moduleRef.get(EmailTemplate);
    websiteTemplate = moduleRef.get(WebsiteTemplate);
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
    jest
      .spyOn(authService, 'getVerifyEmailToken')
      .mockResolvedValue(mockData.randomToken);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('Authenticate with Google (POST /auth/google)', () => {
    it('should return token if authentication success', async () => {
      jest
        .spyOn(authService, 'authWithGoogle')
        .mockResolvedValue(mockData.user);
      const authData = {
        token: 'token',
      };
      const result = await authController.googleAuth(authData);
      expect(authService.authWithGoogle).toHaveBeenCalledWith(authData.token);
      expect(authService.generateToken).toHaveBeenCalledWith(mockData.user);
      expect(result).toEqual({ token: mockData.token });
    });
    it('should throw error if authenticate fail', async () => {
      jest.spyOn(authService, 'authWithGoogle').mockResolvedValue(null);
      const authData = {
        token: 'token',
      };
      await expect(authController.googleAuth(authData)).rejects.toThrow(
        new BadRequestException('Fail to authenticate'),
      );
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(authService, 'authWithGoogle').mockRejectedValue('error');
      const authData = {
        token: 'token',
      };
      await expect(authController.googleAuth(authData)).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  });

  describe('Sign up (POST /auth/signup)', () => {
    it('should return token when successfully sign up an account', async () => {
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
    it('should throw error if user exists', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockData.user);
      jest.spyOn(authService, 'signup').mockResolvedValue(mockData.user);
      const authData = {
        email: 'test@test.com',
        password: 'test',
      };
      await expect(authController.signup(authData)).rejects.toThrow(
        new BadRequestException('User already exists'),
      );
    });
    it('should throw error if fail to create user', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(authService, 'signup').mockResolvedValue(null);
      const authData = {
        email: 'test@test.com',
        password: 'test',
      };
      await expect(authController.signup(authData)).rejects.toThrow(
        new BadRequestException('Fail to create user'),
      );
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockRejectedValue('error');
      const authData = {
        email: 'test@test.com',
        password: 'test',
      };
      await expect(authController.signup(authData)).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })

  describe('Sign in (POST /auth/signin)', () => {
    it('should return token when succesfully sign user in', async () => {
      jest.spyOn(authService, 'signin').mockResolvedValue(mockData.user);
      const authData = {
        email: 'test@test.com',
        password: 'test',
      };
      const result = await authController.signin(authData);
      expect(authService.signin).toHaveBeenCalledWith(authData);
      expect(authService.generateToken).toHaveBeenCalledWith(mockData.user);
      expect(result).toEqual({ token: mockData.token });
    });
    it('should throw error if fail to authenticate', async () => {
      jest.spyOn(authService, 'signin').mockResolvedValue(null);
      const authData = {
        email: 'test@test.com',
        password: 'test',
      };
      await expect(authController.signin(authData)).rejects.toThrow(
        new BadRequestException('Email or password is incorrect'),
      );
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(authService, 'signin').mockRejectedValue('error');
      const authData = {
        email: 'test@test.com',
        password: 'test',
      };
      await expect(authController.signin(authData)).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })

  describe('Change Password (POST /auth/change-password)', () => {
    it('should return success when successfully change password', async () => {
      jest.spyOn(authService, 'changePassword').mockResolvedValue(true);
      const changePasswordDto = {
        recentPassword: 'recentPassword',
        newPassword: 'newPassword',
      }
      const result = await authController.changePassword(mockData.user.user_id, changePasswordDto);
      expect(authService.changePassword).toHaveBeenCalledWith(mockData.user.user_id, changePasswordDto);
      expect(result).toEqual({ success: true });
    })
    it('should throw error if fail to change password', async () => {
      jest.spyOn(authService, 'changePassword').mockRejectedValueOnce(new BadRequestException('Recent password is incorrect'));
      const changePasswordDto = {
        recentPassword: 'recentPassword',
        newPassword: 'newPassword',
      }
      await expect(authController.changePassword(mockData.user.user_id, changePasswordDto)).rejects.toThrow(
        new BadRequestException('Recent password is incorrect'),
      );
    })
    it('should throw error if something went wrong', async () => {
      jest.spyOn(authService, 'changePassword').mockRejectedValueOnce('error');
      const changePasswordDto = {
        recentPassword: 'recentPassword',
        newPassword: 'newPassword',
      }
      await expect(authController.changePassword(mockData.user.user_id, changePasswordDto)).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })

  describe('Verify Email (POST /auth/verify)', () => {
    it('should return succesfully verification page when successfully verify email', async () => {
      jest.spyOn(authService, 'verifyEmail').mockResolvedValue(true);
      const result = await authController.verifyEmail(mockData.randomToken);
      expect(authService.verifyEmail).toHaveBeenCalledWith(mockData.randomToken);
      expect(result).toMatchSnapshot();
    });
    it('should return token invalid page if token is invalid', async () => {
      jest.spyOn(authService, 'verifyEmail').mockRejectedValueOnce(new BadRequestException('Token is invalid:'));
      const result = await authController.verifyEmail(mockData.randomToken);
      expect(authService.verifyEmail).toHaveBeenCalledWith(mockData.randomToken);
      expect(result).toMatchSnapshot();
    });
    it('should return already verify page if email already verified', async () => {
      jest.spyOn(authService, 'verifyEmail').mockRejectedValueOnce(new BadRequestException('Email is already verified:'));
      const result = await authController.verifyEmail(mockData.randomToken);
      expect(authService.verifyEmail).toHaveBeenCalledWith(mockData.randomToken);
      expect(result).toMatchSnapshot();
    });
    it('should return token expiry page if token has expired', async () => {
      jest.spyOn(authService, 'verifyEmail').mockRejectedValueOnce(new BadRequestException('Token has expired:'));
      const result = await authController.verifyEmail(mockData.randomToken);
      expect(authService.verifyEmail).toHaveBeenCalledWith(mockData.randomToken);
      expect(result).toMatchSnapshot();
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(authService, 'verifyEmail').mockRejectedValue('error');
      await expect(
        authController.verifyEmail(mockData.randomToken),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })

  describe('Resent Verify Email (GET /auth/resent-verify-email)', () => {
    it('should return success when successfully resent verify email with Bearer header', async () => {
      jest.spyOn(authService, 'resendVerifyEmail').mockResolvedValue(true);
      const result = await authController.resendVerifyEmail(mockData.user.user_id, null);
      expect(authService.resendVerifyEmail).toHaveBeenCalledWith(mockData.user.user_id);
      expect(result).toEqual({ success: true });
    });
    it('should return success when successfully resent verify email with Query Parameter', async () => {
      jest.spyOn(authService, 'resendVerifyEmail').mockResolvedValue(true);
      const result = await authController.resendVerifyEmail(mockData.user.user_id, null);
      expect(authService.resendVerifyEmail).toHaveBeenCalledWith(mockData.user.user_id);
      expect(result).toEqual({ success: true });
    });
    it('should throw error if fail to resent verify email', async () => {
      jest.spyOn(authService, 'resendVerifyEmail').mockRejectedValueOnce(new BadRequestException('Fail to resent verify email'));
      await expect(authController.resendVerifyEmail(null, null)).rejects.toThrow(
        new BadRequestException('Fail to resent verify email'),
      );
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(authService, 'resendVerifyEmail').mockRejectedValueOnce('error');
      await expect(authController.resendVerifyEmail(null, null)).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })
  
  describe('Request Reset Password (/auth/forget-password)', () => {
    it('should return email and token when request successfully', async () => {
      jest.spyOn(authService, 'requestResetPassword').mockResolvedValue({
        email: mockData.user.email,
        token: mockData.resetPasswordToken,
      });
      const requestResetPasswordDto = {
        email: 'test@test.com',
      };
      const result = await authController.requestResetPassword(
        requestResetPasswordDto,
      );
      expect(authService.requestResetPassword).toHaveBeenCalledWith(
        requestResetPasswordDto.email,
      );
      expect(result).toEqual({
        email: mockData.user.email,
        token: mockData.resetPasswordToken,
      });
    });
    it('should throw error if fail to request reset password', async () => {
      jest.spyOn(authService, 'requestResetPassword').mockRejectedValueOnce(new BadRequestException('Fail to request reset password'));
      const requestResetPasswordDto = {
        email: 'test@test.com',
      };
      await expect(authController.requestResetPassword(requestResetPasswordDto)).rejects.toThrow(
        new BadRequestException('Fail to request reset password'),
      );
    })
    it('should throw error if something went wrong', async () => {
      jest.spyOn(authService, 'requestResetPassword').mockRejectedValue('error');
      const requestResetPasswordDto = {
        email: 'test@test.com',
      };
      await expect(
        authController.requestResetPassword(requestResetPasswordDto),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })

  describe('Verify Reset Password Token (POST /auth/reset-password/verify)', () => {
    it('should return success if token is valid', async () => {
      jest.spyOn(authService, 'verifyResetPasswordToken').mockResolvedValue(true);
      const verifyResetPasswordDto = {
        email: 'test@test.com',
        token: mockData.resetPasswordToken,
      };
      const result = await authController.verifyResetPasswordToken(
        verifyResetPasswordDto,
      );
      expect(authService.verifyResetPasswordToken).toHaveBeenCalledWith(
        verifyResetPasswordDto,
      );
      expect(result).toEqual({
        success: true,
      });
    });
    it('should throw error if token is invalid', async () => {
      jest
        .spyOn(authService, 'verifyResetPasswordToken')
        .mockResolvedValue(false);
      const verifyResetPasswordDto = {
        email: 'test@test.com',
        token: mockData.resetPasswordToken,
      };
      await expect(
        authController.verifyResetPasswordToken(verifyResetPasswordDto),
      ).rejects.toThrow(new BadRequestException('Token is invalid'));
    });
    it('should throw error if something went wrong', async () => {
      jest
        .spyOn(authService, 'verifyResetPasswordToken')
        .mockRejectedValue('error');
      const verifyResetPasswordDto = {
        email: 'test@test.com',
        token: mockData.resetPasswordToken,
      };
      await expect(
        authController.verifyResetPasswordToken(verifyResetPasswordDto),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })
  
  describe('Reset Password (POST /auth/reset-password)', () => {
    it('should return success when successfully reset password', async () => {
      jest.spyOn(authService, 'verifyResetPasswordToken').mockResolvedValue(true);
      const resetPasswordDto = {
        email: 'test@test.com',
        token: mockData.resetPasswordToken,
        password: 'test',
      };
      const result = await authController.resetPassword(resetPasswordDto);
      expect(authService.verifyResetPasswordToken).toHaveBeenCalledWith(
        resetPasswordDto,
      );
      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
      expect(result).toEqual({
        success: true,
      });
    });
    it('should throw error if token is invalid', async () => {
      jest
        .spyOn(authService, 'verifyResetPasswordToken')
        .mockResolvedValue(false);
      const resetPasswordDto = {
        email: 'test@test.com',
        token: mockData.resetPasswordToken,
        password: 'test',
      };
      await expect(
        authController.resetPassword(resetPasswordDto),
      ).rejects.toThrow(new BadRequestException('Token is invalid'));
    });
    it('should throw error if something went wrong', async () => {
      jest
        .spyOn(authService, 'verifyResetPasswordToken')
        .mockRejectedValue('error');
      const resetPasswordDto = {
        email: 'test@test.com',
        token: mockData.resetPasswordToken,
        password: 'test',
      };
      await expect(
        authController.resetPassword(resetPasswordDto),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })
  
  describe('Get User Information (GET /auth/me)', () => {
    it('should return user information', async () => {
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockData.user);
      const result = await authController.getMeInfo(mockData.user.user_id);
      expect(userService.findUserById).toHaveBeenCalledWith(
        mockData.user.user_id,
      );
      expect(result).toEqual(mockData.user);
    });
    it('should throw error if user not found', async () => {
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);
      await expect(
        authController.getMeInfo(mockData.user.user_id),
      ).rejects.toThrow(new BadRequestException('User not found'));
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(userService, 'findUserById').mockRejectedValue('error');
      await expect(
        authController.getMeInfo(mockData.user.user_id),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  })
});
