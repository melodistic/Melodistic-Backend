import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { Mood, MuscleGroup, SectionType } from '../schema/track.schema';
import { Section } from './dto/create-tack.dto';
import * as fs from 'fs';
import { Readable } from 'stream';
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
      tag: '',
      created_at: new Date(),
      updated_at: new Date(),
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
      tag: '',
      created_at: new Date(),
      updated_at: new Date(),
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
  user_generate_track: {
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
  updateDto: {
    program_image: 'test',
  },
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
  userId: '1',
  trackId: '1',
};
jest.mock('./track.service');
describe('Track Controller', () => {
  let trackController: TrackController;
  let trackService: TrackService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TrackController],
      providers: [TrackService],
    }).compile();
    trackService = moduleRef.get(TrackService);
    trackController = moduleRef.get(TrackController);
  });
  beforeEach(() => {
    jest.spyOn(fs, 'unlinkSync');
    jest.spyOn(fs, 'mkdirSync');
    jest.spyOn(fs, 'renameSync');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('Get All Public Tracks (GET /track)', () => {
    it('should return all public tracks if user id is null', async () => {
      jest
        .spyOn(trackService, 'getTrack')
        .mockResolvedValue(mockData.public_track);
      const result = await trackController.getTrack(null);
      expect(result).toEqual(mockData.public_track);
      expect(trackService.getTrack).toHaveBeenCalled();
    });
    it('should return all public tracks with favorite status if user id is specify', async () => {
      jest
        .spyOn(trackService, 'getTrackWithFavorite')
        .mockResolvedValue(mockData.public_track_with_fav);
      const result = await trackController.getTrack(mockData.userId);
      expect(result).toEqual(mockData.public_track_with_fav);
      expect(trackService.getTrackWithFavorite).toHaveBeenCalled();
    });
  });
  describe('Get Track By Id (GET /track/:trackId)', () => {
    it('should return track with given id', async () => {
      jest
        .spyOn(trackService, 'getTrackById')
        .mockResolvedValue(mockData.public_track[0]);
      const result = await trackController.getTrackById(
        mockData.userId,
        mockData.trackId,
      );
      expect(result).toEqual(mockData.public_track[0]);
      expect(trackService.getTrackById).toHaveBeenCalled();
    });
    it('should throw error if track not found', async () => {
      jest.spyOn(trackService, 'getTrackById').mockResolvedValue(null);
      await expect(
        trackController.getTrackById(mockData.userId, mockData.trackId),
      ).rejects.toThrow(new NotFoundException('Track not found'));
      expect(trackService.getTrackById).toHaveBeenCalled();
    });
  });
  describe('Create Track (POST /track)', () => {
    it('should call combiner system and return generated track', async () => {
      jest
        .spyOn(trackService, 'createTrack')
        .mockResolvedValue(mockData.user_generate_track);
      const result = await trackController.createTrack(
        mockData.userId,
        mockData.createDto,
      );
      expect(result).toEqual(mockData.user_generate_track);
      expect(trackService.createTrack).toHaveBeenCalled();
    });
    it('should throw error if fail to create track', async () => {
      jest
        .spyOn(trackService, 'createTrack')
        .mockRejectedValue(new BadRequestException('Fail to create Track'));
      await expect(
        trackController.createTrack('1', mockData.createDto),
      ).rejects.toThrow(new BadRequestException('Fail to create Track'));
      expect(trackService.createTrack).toHaveBeenCalled();
    });
  });
  describe('Update Track Image (POST /track/:trackId/image)', () => {
    it('should return updated track', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest
        .spyOn(trackService, 'checkUserTrack')
        .mockResolvedValue(mockData.user_generate_track);
      jest
        .spyOn(trackService, 'updateTrackImage')
        .mockResolvedValue(mockData.public_track[0]);
      const result = await trackController.updateTrackImage(
        '1',
        mockData.updateDto,
        '1',
        mockData.file,
      );
      expect(result).toEqual(mockData.public_track[0]);
      expect(trackService.checkUserTrack).toHaveBeenCalled();
      expect(trackService.updateTrackImage).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.renameSync).toHaveBeenCalled();
    });
    it('should throw error if not found track', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(trackService, 'checkUserTrack').mockResolvedValue(null);
      await expect(
        trackController.updateTrackImage(
          '1',
          mockData.updateDto,
          '1',
          mockData.file,
        ),
      ).rejects.toThrow(new NotFoundException('Track not found'));
      expect(trackService.checkUserTrack).toHaveBeenCalled();
    });
    it('should throw error if fail to update track', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest
        .spyOn(trackService, 'checkUserTrack')
        .mockResolvedValue(mockData.user_generate_track);
      jest
        .spyOn(trackService, 'updateTrackImage')
        .mockRejectedValue(
          new InternalServerErrorException('Fail to update Track'),
        );
      await expect(
        trackController.updateTrackImage(
          '1',
          mockData.updateDto,
          '1',
          mockData.file,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException('Fail to update Track'),
      );
      expect(trackService.checkUserTrack).toHaveBeenCalled();
      expect(trackService.updateTrackImage).toHaveBeenCalled();
    });
  });
  describe('Delete Track By Id (DELETE /track/:trackId)', () => {
    it('should return success message if track is deleted', async () => {
      jest.spyOn(trackService, 'checkExistTrack').mockResolvedValueOnce(true);
      jest.spyOn(trackService, 'checkUserTrack').mockResolvedValueOnce(true);
      jest
        .spyOn(trackService, 'deleteGeneratedTrack')
        .mockImplementationOnce(jest.fn());
      jest
        .spyOn(trackService, 'deleteFavoriteTrack')
        .mockImplementationOnce(jest.fn());
      jest.spyOn(trackService, 'deleteTrack').mockImplementationOnce(jest.fn());
      const result = await trackController.deleteTrack(
        mockData.userId,
        mockData.trackId,
      );
      expect(result).toBeDefined();
      expect(result.status).toBe(200);
      expect(result.message).toBe('Track deleted');
      expect(trackService.checkExistTrack).toHaveBeenCalled();
      expect(trackService.checkUserTrack).toHaveBeenCalled();
      expect(trackService.deleteGeneratedTrack).toHaveBeenCalled();
      expect(trackService.deleteFavoriteTrack).toHaveBeenCalled();
      expect(trackService.deleteTrack).toHaveBeenCalled();
    });
    it('should throw error if track not found', async () => {
      jest.spyOn(trackService, 'checkExistTrack').mockResolvedValueOnce(false);
      await expect(
        trackController.deleteTrack(mockData.userId, mockData.trackId),
      ).rejects.toThrow(new NotFoundException('Track not found'));
      expect(trackService.checkExistTrack).toHaveBeenCalled();
    });
    it('should throw error if track is not belong to user', async () => {
      jest.spyOn(trackService, 'checkExistTrack').mockResolvedValueOnce(true);
      jest.spyOn(trackService, 'checkUserTrack').mockResolvedValueOnce(false);
      await expect(
        trackController.deleteTrack(mockData.userId, mockData.trackId),
      ).rejects.toThrow(new NotFoundException('Track not found'));
      expect(trackService.checkExistTrack).toHaveBeenCalled();
      expect(trackService.checkUserTrack).toHaveBeenCalled();
    });
    it('should throw error if fail to delete Track', async () => {
      jest.spyOn(trackService, 'checkExistTrack').mockResolvedValueOnce(true);
      jest.spyOn(trackService, 'checkUserTrack').mockResolvedValueOnce(true);
      jest.spyOn(trackService, 'deleteGeneratedTrack').mockRejectedValueOnce('error');
      await expect(
        trackController.deleteTrack(mockData.userId, mockData.trackId),
      ).rejects.toThrow(new InternalServerErrorException('Fail to delete Track'));
      expect(trackService.checkExistTrack).toHaveBeenCalled();
      expect(trackService.checkUserTrack).toHaveBeenCalled();
      expect(trackService.deleteGeneratedTrack).toHaveBeenCalled();
    });
  });
});
