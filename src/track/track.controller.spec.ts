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
      created_at: new Date(),
      updated_at: new Date(),
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
};
jest.mock('./track.service');
describe('Auth Controller', () => {
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
    jest.spyOn(fs, 'unlinkSync')
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'mkdirSync')
    jest.spyOn(fs, 'renameSync')
  })
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('GET /track should return all public tracks', async () => {
    jest
      .spyOn(trackService, 'getTrack')
      .mockResolvedValue(mockData.public_track);
    const result = await trackController.getTrack();
    expect(result).toEqual(mockData.public_track);
    expect(trackService.getTrack).toHaveBeenCalled();
  });
  it('GET /track/:trackId should return track with given id', async () => {
    jest
      .spyOn(trackService, 'getTrackById')
      .mockResolvedValue(mockData.public_track[0]);
    const result = await trackController.getTrackById('1', '1');
    expect(result).toEqual(mockData.public_track[0]);
    expect(trackService.getTrackById).toHaveBeenCalled();
  });
  it('POST /track should return generated track', async () => {
    jest
      .spyOn(trackService, 'createTrack')
      .mockResolvedValue(mockData.user_generate_track);
    const result = await trackController.createTrack('1', mockData.createDto);
    expect(result).toEqual(mockData.user_generate_track);
    expect(trackService.createTrack).toHaveBeenCalled();
  });
  it('POST /track should throw BadRequestException if fail to create track', async () => {
    jest
      .spyOn(trackService, 'createTrack')
      .mockRejectedValue(new BadRequestException('Fail to create Track'));
    await expect(
      trackController.createTrack('1', mockData.createDto),
    ).rejects.toThrow(new BadRequestException('Fail to create Track'));
    expect(trackService.createTrack).toHaveBeenCalled();
  });
  it('POST /track/:trackId/image should return updated track', async () => {
    
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
  });
  it('POST /track/:trackId/image should throw NotFoundException if not found track', async () => {
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
  it('POST /track/:trackId/image should throw InternalServerErrorException if fail to update track', async () => {
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
    ).rejects.toThrow(new InternalServerErrorException('Fail to update Track'));
    expect(trackService.checkUserTrack).toHaveBeenCalled();
    expect(trackService.updateTrackImage).toHaveBeenCalled();
  });
});
