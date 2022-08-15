import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
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
};
describe('Track Service', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService, UserService],
    }).compile();
    userService = moduleRef.get(UserService);
    prismaService = moduleRef.get(PrismaService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("findUserById should return user's data", async () => {
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
  it("findUserByEmail should return user's data", async () => {
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockData.user);
    const result = await userService.findUserByEmail(mockData.user.email);
    expect(result).toBe(mockData.user);
    expect(result).toHaveProperty('user_id');
    expect(result).toHaveProperty('email');
    expect(prismaService.user.findFirst).toHaveBeenCalled();
  });
  it("getUserLibrary should return user's library", async () => {
    jest
      .spyOn(prismaService.generatedTrack, 'findMany')
      .mockResolvedValue(mockData.generatedTrack);
    const result = await userService.getUserLibrary(mockData.user.user_id);
    expect(result).toBe(mockData.generatedTrack);
    expect(prismaService.generatedTrack.findMany).toHaveBeenCalled();
  });
  it("getUserFavorite should return user's favorite", async () => {
    jest
      .spyOn(prismaService.userFavorite, 'findMany')
      .mockResolvedValue(mockData.favoriteTrack);
    const result = await userService.getUserFavorite(mockData.user.user_id);
    expect(result).toBe(mockData.favoriteTrack);
    expect(prismaService.userFavorite.findMany).toHaveBeenCalled();
  });
  it('toggleFavorite should return success if exist favorite', async () => {
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
  it('toggleFavorite should return created if track is not favorite', async () => {
    jest.spyOn(prismaService.userFavorite, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(prismaService.userFavorite, 'create')
      .mockResolvedValue(mockData.favoriteTrack[0]);
    const result = await userService.toggleFavorite(
      mockData.user.user_id,
      mockData.favoriteTrack[0].track_id,
    );
    expect(result).toBeDefined();
    expect(result.status).toEqual(201);
    expect(result.message).toEqual('Track added to favorite');
    expect(prismaService.userFavorite.findFirst).toHaveBeenCalled();
    expect(prismaService.userFavorite.create).toHaveBeenCalled();
  });
  it('uploadImage should return success if upload image', async () => {
    jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockData.user);
    const result = await userService.uploadImage(
      mockData.user.user_id,
      mockData.user.user_profile_image,
    );
    expect(result).toBeDefined();
    expect(result.status).toEqual(200);
    expect(result.message).toEqual('Image uploaded');
    expect(prismaService.user.update).toHaveBeenCalled();
  });
});
