import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TrackService } from './track.service';
import { Mood, MuscleGroup, SectionType } from '../schema/track.schema';
import { Section } from './dto/create-tack.dto';
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
};
describe('Track Service', () => {
  let trackService: TrackService;
  let prismaService: PrismaService;
  let httpService: HttpService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 60000,
          maxRedirects: 5,
        }),
      ],
      providers: [PrismaService, TrackService],
    }).compile();
    trackService = moduleRef.get(TrackService);
    prismaService = moduleRef.get(PrismaService);
    httpService = moduleRef.get(HttpService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('getTrack should return all public tracks', async () => {
    jest
      .spyOn(prismaService.track, 'findMany')
      .mockResolvedValue(mockData.public_track);
    const result = await trackService.getTrack();
    expect(result).toEqual(mockData.public_track);
    expect(prismaService.track.findMany).toHaveBeenCalled();
  });
  it('getTrackById should return track by id if track is public', async () => {
    jest
      .spyOn(prismaService.track, 'findFirst')
      .mockResolvedValue(mockData.public_track[0]);
    const result = await trackService.getTrackById('1', '1');
    expect(result).toEqual(mockData.public_track[0]);
    expect(prismaService.track.findFirst).toHaveBeenCalled();
  });
  it('getTrackById should return track by id if track is private and user is owner', async () => {
    jest.spyOn(prismaService.track, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prismaService.generatedTrack, 'findFirst').mockResolvedValue({
      ...mockData.generate_track,
      Track: jest.fn().mockReturnValue(mockData.public_track[0])(),
    });
    const result = await trackService.getTrackById('1', '1');
    expect(result).toEqual(mockData.public_track[0]);
    expect(prismaService.track.findFirst).toHaveBeenCalled();
    expect(prismaService.generatedTrack.findFirst).toHaveBeenCalled();
  });
  it('getTrackById should return null if track is not exist or track is private and user is not owner', async () => {
    jest.spyOn(prismaService.track, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(prismaService.generatedTrack, 'findFirst')
      .mockResolvedValue(null);
    const result = await trackService.getTrackById('1', '1');
    expect(result).toBeNull();
    expect(prismaService.track.findFirst).toHaveBeenCalled();
    expect(prismaService.generatedTrack.findFirst).toHaveBeenCalled();
  });
  it('createTrack should return success with track id', async () => {
    jest.spyOn(httpService.axiosRef, 'post').mockResolvedValue({
      data: {
        track_id: '1',
      },
    });
    jest
      .spyOn(prismaService.generatedTrack, 'create')
      .mockResolvedValue(mockData.generate_track);
    const result = await trackService.createTrack('1', mockData.createDto);
    expect(result).toBeDefined();
    expect(result.status).toEqual(200);
    expect(result.message).toEqual("Track created successfully");
    expect(result.track_id).toEqual('1')
    expect(httpService.axiosRef.post).toHaveBeenCalled();
    expect(prismaService.generatedTrack.create).toHaveBeenCalled();
  });
  it('checkUserTrack should return track if user is owner', async () => {
    jest.spyOn(prismaService.generatedTrack, 'findFirst').mockResolvedValue(mockData.generate_track);
    const result = await trackService.checkUserTrack('1', '1');
    expect(result).toEqual(mockData.generate_track);
    expect(prismaService.generatedTrack.findFirst).toHaveBeenCalled();
  })
  it('checkUserTrack should return null if track not found', async () => {
    jest.spyOn(prismaService.generatedTrack, 'findFirst').mockResolvedValue(null);
    const result = await trackService.checkUserTrack('1', '1');
    expect(result).toBeNull();
    expect(prismaService.generatedTrack.findFirst).toHaveBeenCalled();
  })
  it("updateTrackImage should return track", async () => {
    jest.spyOn(prismaService.track, 'update').mockResolvedValue(mockData.public_track[0]);
    const result = await trackService.updateTrackImage('1', '.png');
    expect(result).toEqual(mockData.public_track[0]);
    expect(prismaService.track.update).toHaveBeenCalled();
  })
});
