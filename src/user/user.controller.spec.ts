import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { Readable } from 'stream';
import { UserController } from './user.controller';
import { UserService } from './user.service';
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
};
jest.mock('./user.service');
describe('User Controller', () => {
  let userController: UserController;
  let userService: UserService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();
    userService = moduleRef.get(UserService);
    userController = moduleRef.get(UserController);
  });
  beforeEach(() => {
    jest.spyOn(fs, 'unlinkSync');
    jest.spyOn(fs, 'mkdirSync');
    jest.spyOn(fs, 'renameSync');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it("GET /user/library should return user's library", async () => {
    jest
      .spyOn(userService, 'getUserLibrary')
      .mockResolvedValue(mockData.generatedTrack);
    const result = await userController.getLibrary('1');
    expect(result).toEqual(mockData.generatedTrack);
    expect(userService.getUserLibrary).toHaveBeenCalled();
  });
  it("GET /user/favorite should return user's favorite tracks", async () => {
    jest
      .spyOn(userService, 'getUserFavorite')
      .mockResolvedValue(mockData.favoriteTrack);
    const result = await userController.getFavorite('1');
    expect(result).toEqual(mockData.favoriteTrack);
    expect(userService.getUserFavorite).toHaveBeenCalled();
  });
  it("POST /user/favorite should add a track to user's favorite", async () => {
    jest.spyOn(userService, 'toggleFavorite').mockResolvedValue({
      status: 201,
      message: 'Track added to favorite',
    });
    const result = await userController.toggleFavorite('1', {
      track_id: '1',
    });
    expect(result).toBeDefined();
    expect(result.status).toEqual(201);
    expect(result.message).toEqual('Track added to favorite');
    expect(userService.toggleFavorite).toHaveBeenCalled();
  });
  it("POST /user/favorite should remove track from user's favorite", async () => {
    jest.spyOn(userService, 'toggleFavorite').mockResolvedValue({
      status: 200,
      message: 'Track removed from favorite',
    });
    const result = await userController.toggleFavorite('1', {
      track_id: '1',
    });
    expect(result).toBeDefined();
    expect(result.status).toEqual(200);
    expect(result.message).toEqual('Track removed from favorite');
    expect(userService.toggleFavorite).toHaveBeenCalled();
  });
  it('POST /user/image should update user profile image', async () => {
    jest.spyOn(userService, 'uploadImage').mockResolvedValue({
      status: 200,
      message: 'Profile image updated',
    });
    const result = await userController.uploadProfileImage(
      '1',
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
    jest
      .spyOn(userService, 'uploadImage')
      .mockRejectedValue(new BadRequestException('Invalid Image'));
    await expect(
      userController.uploadProfileImage('1', { image: 'test' }, mockData.file),
    ).rejects.toThrow(new BadRequestException('Invalid image'));
    expect(userService.uploadImage).toHaveBeenCalled();
  });
});
