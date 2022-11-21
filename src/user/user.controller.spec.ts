import { Test } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { Readable } from 'stream';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TrackService } from '../track/track.service';
const mockData = {
  user: {
    user_id: '1',
    email: 'test@test.com',
    user_profile_image: null,
    password: null,
    created_at: null,
    updated_at: null,
    exercise_duration_hour: null,
    exercise_duration_minute: null,
    email_verification_token: null,
    email_verification_token_expiry: null,
    email_verified: null,
  },
  favoriteTrack: [
    {
      user_favorite_id: '1',
      user_id: '1',
      track_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
      Track: jest.fn().mockReturnValue({
        track_id: '1',
        track_name: 'Track 1',
        track_image_url: null,
        track_path: null,
        muscle_group: null,
        description: null,
        duration: null,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      })(),
    },
  ],
  generatedTrack: [
    {
      generated_track_id: '1',
      user_id: '1',
      track_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
      Track: jest.fn().mockReturnValue({
        track_id: '1',
        track_name: 'Track 1',
        track_image_url: null,
        track_path: null,
        muscle_group: null,
        description: null,
        duration: null,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      })(),
    },
    {
      generated_track_id: '2',
      user_id: '1',
      track_id: '2',
      created_at: new Date(),
      updated_at: new Date(),
      Track: jest.fn().mockReturnValue({
        track_id: '2',
        track_name: 'Track 2',
        track_image_url: null,
        track_path: null,
        muscle_group: null,
        description: null,
        duration: null,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      })(),
    },
  ],
  file: {
    path: 'test',
    mimetype: 'test/png',
    fieldname: 'program_image',
    filename: 'test.png',
    originalname: 'test',
    encoding: 'utf8',
    size: 1,
    destination: '/uploads',
    stream: new Readable(),
    buffer: Buffer.from('test'),
  },
  trackId: '1',
  durationDto: {
    duration_hour: 1,
    duration_minute: 1,
  },
};
jest.mock('../track/track.service');
jest.mock('./user.service');
describe('User Controller', () => {
  let userController: UserController;
  let userService: UserService;
  let trackService: TrackService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, TrackService],
    }).compile();
    userService = moduleRef.get(UserService);
    userController = moduleRef.get(UserController);
    trackService = moduleRef.get(TrackService);
  });
  beforeEach(() => {
    jest.spyOn(fs, 'unlinkSync');
    jest.spyOn(fs, 'mkdirSync');
    jest.spyOn(fs, 'renameSync');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('Get User Library (GET /user/library)', () => {
    it('should return tracks in user library', async () => {
      jest
        .spyOn(userService, 'getUserLibrary')
        .mockResolvedValue(mockData.generatedTrack);
      const result = await userController.getLibrary(mockData.user.user_id);
      expect(result).toEqual(mockData.generatedTrack);
      expect(userService.getUserLibrary).toHaveBeenCalled();
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(userService, 'getUserLibrary').mockRejectedValueOnce('error');
      await expect(
        userController.getLibrary(mockData.user.user_id),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  });
  describe('Get User Favorite (GET /user/favorite)', () => {
    it("GET /user/favorite should return user's favorite tracks", async () => {
      jest
        .spyOn(userService, 'getUserFavorite')
        .mockResolvedValue(mockData.favoriteTrack);
      const result = await userController.getFavorite(mockData.user.user_id);
      expect(result).toEqual(mockData.favoriteTrack);
      expect(userService.getUserFavorite).toHaveBeenCalled();
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(userService, 'getUserFavorite').mockRejectedValueOnce('error');
      await expect(
        userController.getFavorite(mockData.user.user_id),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  });
  describe('Toggle Favorite (POST /user/favorite)', () => {
    it("should add a track to user's favorite if track is not favorite by user", async () => {
      jest.spyOn(trackService, 'checkExistTrack').mockResolvedValueOnce(true);
      jest.spyOn(userService, 'toggleFavorite').mockResolvedValue({
        status: 201,
        message: 'Track added to favorite',
      });
      const result = await userController.toggleFavorite(
        mockData.user.user_id,
        {
          track_id: mockData.trackId,
        },
      );
      expect(result).toBeDefined();
      expect(result.status).toEqual(201);
      expect(result.message).toEqual('Track added to favorite');
      expect(userService.toggleFavorite).toHaveBeenCalled();
    });
    it("should remove track from user's favorite if user already favorite track", async () => {
      jest.spyOn(trackService, 'checkExistTrack').mockResolvedValueOnce(true);
      jest.spyOn(userService, 'toggleFavorite').mockResolvedValue({
        status: 200,
        message: 'Track removed from favorite',
      });
      const result = await userController.toggleFavorite(
        mockData.user.user_id,
        {
          track_id: mockData.trackId,
        },
      );
      expect(result).toBeDefined();
      expect(result.status).toEqual(200);
      expect(result.message).toEqual('Track removed from favorite');
      expect(userService.toggleFavorite).toHaveBeenCalled();
    });
    it('should throw error if track is not found', async () => {
      jest.spyOn(trackService, 'checkExistTrack').mockResolvedValueOnce(false);
      await expect(
        userController.toggleFavorite(mockData.user.user_id, {
          track_id: mockData.trackId,
        }),
      ).rejects.toThrow(new NotFoundException('Track not found'));
    });
    it('should throw error if something went wrong', async () => {
      jest.spyOn(trackService, 'checkExistTrack').mockResolvedValueOnce(true);
      jest.spyOn(userService, 'toggleFavorite').mockRejectedValueOnce('error');
      await expect(
        userController.toggleFavorite(mockData.user.user_id, {
          track_id: mockData.trackId,
        }),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  });
  describe('Set Exercise Duration (POST /user/duration)', () => {
    it('should update user exercise duration', async () => {
      jest.spyOn(userService, 'updateExerciseDuration').mockResolvedValue({
        status: 200,
        message: 'Exercise duration updated',
      });
      const result = await userController.updateExerciseDuration(
        mockData.user.user_id,
        mockData.durationDto,
      );
      expect(result).toBeDefined();
      expect(result.status).toEqual(200);
      expect(result.message).toEqual('Exercise duration updated');
      expect(userService.updateExerciseDuration).toHaveBeenCalled();
    });
    it('should throw error if something went wrong', async () => {
      jest
        .spyOn(userService, 'updateExerciseDuration')
        .mockRejectedValueOnce('error');
      await expect(
        userController.updateExerciseDuration(
          mockData.user.user_id,
          mockData.durationDto,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
    });
  });
  describe('Update User Profile Image (POST /user/image)', () => {
    it('POST /user/image should update user profile image', async () => {
      jest.spyOn(userService, 'uploadImage').mockResolvedValue({
        status: 200,
        message: 'Profile image updated',
      });
      const result = await userController.uploadProfileImage(
        mockData.user.user_id,
        {
          image: 'test',
        },
        mockData.file,
      );
      expect(result).toBeDefined();
      expect(result.status).toEqual(200);
      expect(result.message).toEqual('Profile image updated');
      expect(userService.uploadImage).toHaveBeenCalled();
    });
    it('POST /user/image should throw error when something went wrong', async () => {
      jest.spyOn(userService, 'uploadImage').mockRejectedValue('error');
      await expect(
        userController.uploadProfileImage(
          mockData.user.user_id,
          { image: 'test' },
          mockData.file,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException('Internal Server Error'),
      );
      expect(userService.uploadImage).toHaveBeenCalled();
    });
  });
});
