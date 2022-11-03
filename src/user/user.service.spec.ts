import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';
import { PreprocessorService } from '../utils/preprocessor.service';
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
  preprocessedFavoriteTrack: [
    {
      user_favorite_id: '1',
      user_id: '1',
      track_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
      is_favorite: true,
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
};

jest.mock('../utils/preprocessor.service');
describe('Track Service', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  let preprocessorSerivce: PreprocessorService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService, UserService, PreprocessorService],
    }).compile();
    userService = moduleRef.get(UserService);
    prismaService = moduleRef.get(PrismaService);
    preprocessorSerivce = moduleRef.get(PreprocessorService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it("should return user's data", async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(mockData.user);
      const result = await userService.findUserById(mockData.user.user_id);
      expect(result).toBe(mockData.user);
      expect(result).toHaveProperty('user_id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('user_profile_image');
      expect(prismaService.user.findFirst).toHaveBeenCalled();
    });
  });

  describe('findUserByEmail', () => {
    it("should return user's data", async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(mockData.user);
      const result = await userService.findUserByEmail(mockData.user.email);
      expect(result).toBe(mockData.user);
      expect(result).toHaveProperty('user_id');
      expect(result).toHaveProperty('email');
      expect(prismaService.user.findFirst).toHaveBeenCalled();
    });
  });

  describe('getUserLibrary', () => {
    it("should return user's library", async () => {
      jest
        .spyOn(prismaService, '$queryRaw')
        .mockResolvedValue(mockData.generatedTrack);
      const result = await userService.getUserLibrary(mockData.user.user_id);
      expect(result).toBe(mockData.generatedTrack);
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('getUserFavorite', () => {
    it("should return user's favorite", async () => {
      jest
        .spyOn(prismaService.userFavorite, 'findMany')
        .mockResolvedValue(mockData.favoriteTrack);
      jest
        .spyOn(preprocessorSerivce, 'preprocessUserFavoriteTrack')
        .mockResolvedValue(mockData.preprocessedFavoriteTrack);
      const result = await userService.getUserFavorite(mockData.user.user_id);
      expect(result).toBe(mockData.preprocessedFavoriteTrack);
      expect(prismaService.userFavorite.findMany).toHaveBeenCalled();
      expect(preprocessorSerivce.preprocessUserFavoriteTrack).toHaveBeenCalled();
    });
  });

  describe('toggleFavorite', () => {
    it('should return success if exist favorite', async () => {
      jest
        .spyOn(prismaService.userFavorite, 'findFirst')
        .mockResolvedValue(mockData.favoriteTrack[0]);
      jest
        .spyOn(prismaService.userFavorite, 'delete')
        .mockResolvedValue(mockData.favoriteTrack[0]);
      const result = await userService.toggleFavorite(
        mockData.user.user_id,
        mockData.favoriteTrack[0].track_id,
      );
      expect(result).toBeDefined();
      expect(result.status).toEqual(200);
      expect(result.message).toEqual('Track removed from favorite');
      expect(prismaService.userFavorite.findFirst).toHaveBeenCalled();
      expect(prismaService.userFavorite.delete).toHaveBeenCalled();
    });
    it('should return created if track is not favorite', async () => {
      jest
        .spyOn(prismaService.userFavorite, 'findFirst')
        .mockResolvedValue(null);
      jest
        .spyOn(prismaService.userFavorite, 'create')
        .mockResolvedValue(mockData.favoriteTrack[0]);
      await userService.toggleFavorite(
        mockData.user.user_id,
        mockData.favoriteTrack[0].track_id,
      );
      expect(prismaService.userFavorite.findFirst).toHaveBeenCalled();
      expect(prismaService.userFavorite.create).toHaveBeenCalled();
    });
  });

  describe('uploadImage', () => {
    it('should return success if upload image', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockData.user);
      await userService.uploadImage(
        mockData.user.user_id,
        mockData.user.user_profile_image,
      );
      expect(prismaService.user.update).toHaveBeenCalled();
    });
  });
});
