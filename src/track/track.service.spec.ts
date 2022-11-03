import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TrackService } from './track.service';
import { Mood, MuscleGroup, SectionType } from '../schema/track.schema';
import { Section } from './dto/create-tack.dto';
import { PreprocessorService } from '../utils/preprocessor.service';
const mockData = {
  public_track: [
    {
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
      tag: '',
    },
    {
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
      tag: '',
    },
  ],
  public_track_with_user_fav: [
    {
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
      tag: '',
      UserFavorite: [
        {
          user_favorite_id: '1',
        },
      ],
    },
    {
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
      tag: '',
      UserFavorite: [],
    },
  ],
  public_track_with_fav: [
    {
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
      tag: '',
      is_favorite: true,
    },
    {
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
      tag: '',
      is_favorite: false,
    },
  ],
  generate_track: {
    generated_track_id: '1',
    user_id: '1',
    track_id: '1',
    created_at: new Date(),
    updated_at: new Date(),
  },
  createDto: {
    program_name: 'test name',
    muscle_group: MuscleGroup.ABS,
    sections: [
      {
        section_name: 'test name',
        section_type: SectionType.WARMUP,
        duration: 1,
        mood: Mood.CHILL,
      },
    ] as [Section],
  },
  userId: '1',
  trackId: '1',
};
describe('Track Service', () => {
  let trackService: TrackService;
  let prismaService: PrismaService;
  let httpService: HttpService;
  let preprocessorService: PreprocessorService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 60000,
          maxRedirects: 5,
        }),
      ],
      providers: [PrismaService, TrackService, PreprocessorService],
    }).compile();
    trackService = moduleRef.get(TrackService);
    prismaService = moduleRef.get(PrismaService);
    httpService = moduleRef.get(HttpService);
    preprocessorService = moduleRef.get(PreprocessorService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('getTrack', () => {
    it('should return all public tracks', async () => {
      jest
        .spyOn(prismaService.track, 'findMany')
        .mockResolvedValue(mockData.public_track);
      const result = await trackService.getTrack();
      expect(result).toEqual(mockData.public_track);
      expect(prismaService.track.findMany).toHaveBeenCalled();
    });
  });
  describe('getTrackWithFavorite', () => {
    it('should return all public tracks with favorite', async () => {
      jest
        .spyOn(prismaService.track, 'findMany')
        .mockResolvedValue(mockData.public_track_with_user_fav);
      jest.spyOn(preprocessorService, 'preprocessFavoriteTrack')
      const result = await trackService.getTrackWithFavorite(mockData.userId);
      expect(result).toEqual(mockData.public_track_with_fav);
      expect(prismaService.track.findMany).toHaveBeenCalled();
      expect(preprocessorService.preprocessFavoriteTrack).toHaveBeenCalled();
    });
  });
  describe('getTrackById', () => {
    it('should return track by id if track is public', async () => {
      jest
        .spyOn(prismaService.track, 'findFirst')
        .mockResolvedValue(mockData.public_track[0]);
      const result = await trackService.getTrackById(
        mockData.userId,
        mockData.trackId,
      );
      expect(result).toEqual(mockData.public_track[0]);
      expect(prismaService.track.findFirst).toHaveBeenCalled();
    });
    it('should return track by id if track is private and user is owner', async () => {
      jest.spyOn(prismaService.track, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaService.generatedTrack, 'findFirst').mockResolvedValue({
        ...mockData.generate_track,
        Track: jest.fn().mockReturnValue(mockData.public_track[0])(),
      });
      const result = await trackService.getTrackById(
        mockData.userId,
        mockData.trackId,
      );
      expect(result).toEqual(mockData.public_track[0]);
      expect(prismaService.track.findFirst).toHaveBeenCalled();
      expect(prismaService.generatedTrack.findFirst).toHaveBeenCalled();
    });
    it('should return null if track is not exist or track is private and user is not owner', async () => {
      jest.spyOn(prismaService.track, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prismaService.generatedTrack, 'findFirst')
        .mockResolvedValue(null);
      const result = await trackService.getTrackById(
        mockData.userId,
        mockData.trackId,
      );
      expect(result).toBeNull();
      expect(prismaService.track.findFirst).toHaveBeenCalled();
      expect(prismaService.generatedTrack.findFirst).toHaveBeenCalled();
    });
  });
  describe('createTrack', () => {
    it('should return success with track id', async () => {
      jest.spyOn(httpService.axiosRef, 'post').mockResolvedValue({
        data: {
          track_id: mockData.trackId,
        },
      });
      jest
        .spyOn(prismaService.generatedTrack, 'create')
        .mockResolvedValue(mockData.generate_track);
      const result = await trackService.createTrack(
        mockData.userId,
        mockData.createDto,
      );
      expect(result).toBeDefined();
      expect(result.status).toEqual(200);
      expect(result.message).toEqual('Track created successfully');
      expect(result.track_id).toEqual('1');
      expect(httpService.axiosRef.post).toHaveBeenCalled();
      expect(prismaService.generatedTrack.create).toHaveBeenCalled();
    });
  });
  describe('checkExistTrack', () => {
    it('should return true if track is exist', async () => {
      jest
        .spyOn(prismaService.track, 'findFirst')
        .mockResolvedValue(mockData.public_track[0]);
      const result = await trackService.checkExistTrack(mockData.trackId);
      expect(result).toBeTruthy();
      expect(prismaService.track.findFirst).toHaveBeenCalled();
    });
    it('should return false if track not found', async () => {
      jest.spyOn(prismaService.track, 'findFirst').mockResolvedValue(null);
      const result = await trackService.checkExistTrack(mockData.trackId);
      expect(result).toBeFalsy();
      expect(prismaService.track.findFirst).toHaveBeenCalled();
    });
  });
  describe('checkUserTrack', () => {
    it('should return track if user is owner', async () => {
      jest
        .spyOn(prismaService.generatedTrack, 'findFirst')
        .mockResolvedValue(mockData.generate_track);
      const result = await trackService.checkUserTrack(
        mockData.userId,
        mockData.trackId,
      );
      expect(result).toEqual(mockData.generate_track);
      expect(prismaService.generatedTrack.findFirst).toHaveBeenCalled();
    });
    it('should return null if track not found', async () => {
      jest
        .spyOn(prismaService.generatedTrack, 'findFirst')
        .mockResolvedValue(null);
      const result = await trackService.checkUserTrack(
        mockData.userId,
        mockData.trackId,
      );
      expect(result).toBeNull();
      expect(prismaService.generatedTrack.findFirst).toHaveBeenCalled();
    });
  });
  describe('updateTrackImage', () => {
    it('should return track', async () => {
      jest
        .spyOn(prismaService.track, 'update')
        .mockResolvedValue(mockData.public_track[0]);
      const result = await trackService.updateTrackImage(
        mockData.trackId,
        '.png',
      );
      expect(result).toEqual(mockData.public_track[0]);
      expect(prismaService.track.update).toHaveBeenCalled();
    });
  });
  describe('deleteGeneratedTrack', () => {
    it('should delete generated track', async () => {
      jest
        .spyOn(prismaService.generatedTrack, 'deleteMany')
        .mockImplementationOnce(jest.fn());
      await trackService.deleteGeneratedTrack(
        mockData.userId,
        mockData.trackId,
      );
      expect(prismaService.generatedTrack.deleteMany).toHaveBeenCalled();
    });
  });
  describe('deleteFavoriteTrack', () => {
    it('should delete favorite track', async () => {
      jest
        .spyOn(prismaService.userFavorite, 'deleteMany')
        .mockImplementationOnce(jest.fn());
      await trackService.deleteFavoriteTrack(
        mockData.userId,
        mockData.trackId,
      );
      expect(prismaService.userFavorite.deleteMany).toHaveBeenCalled();
    });
  });
  describe('deleteTrack', () => {
    it('should delete track', async () => {
      jest
        .spyOn(prismaService.track, 'delete')
        .mockImplementationOnce(jest.fn());
      await trackService.deleteTrack(
        mockData.trackId,
      );
      expect(prismaService.track.delete).toHaveBeenCalled();
    });
  });
});
