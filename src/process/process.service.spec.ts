import { Test } from '@nestjs/testing';
import { ProcessService } from './process.service';
import { PrismaService } from '../prisma.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Decimal } from '@prisma/client/runtime';
import { BadRequestException } from '@nestjs/common';

const mockData = {
  processInfos: [
    {
      process_id: '1',
      user_id: '1',
      music_name: '',
      duration: 1,
      mood: 'Chill',
      bpm: new Decimal(120.1),
      created_at: new Date(),
      updated_at: new Date(),
      is_processing: false,
    },
  ],
  processedExtracts: [
    {
      processed_id: '1',
      processed_music_extract_id: '1',
      music_id: '1',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  userId: '1',
  youtubeURL: 'https://www.youtube.com/watch?v=1',
};

describe('Process Controller', () => {
  let processService: ProcessService;
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
      providers: [PrismaService, ProcessService],
    }).compile();
    prismaService = moduleRef.get(PrismaService);
    httpService = moduleRef.get(HttpService);
    processService = moduleRef.get(ProcessService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('getProcessInformation', () => {
    it('should return processed music information', async () => {
      jest
        .spyOn(prismaService.processedMusic, 'findMany')
        .mockResolvedValue(mockData.processInfos);
      const result = await processService.getProcessInformation(
        mockData.userId,
      );
      expect(result).toEqual(mockData.processInfos);
    });
  });
  describe('processMusicFromYoutube', () => {
    it('should start processing', async () => {
      jest.spyOn(httpService.axiosRef, 'post').mockResolvedValue('success');
      await processService.processMusicFromYoutube(
        mockData.userId,
        mockData.youtubeURL,
      );
      expect(httpService.axiosRef.post).toHaveBeenCalled();
    });
    it('should throw error if error from axios', async () => {
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockRejectedValue(new BadRequestException('error'));
      await expect(
        processService.processMusicFromYoutube(
          mockData.userId,
          mockData.youtubeURL,
        ),
      ).rejects.toThrow(new BadRequestException('error'));
    });
  });
  describe('processMusicFromFile', () => {
    it('should start processing', async () => {
      jest.spyOn(httpService.axiosRef, 'post').mockResolvedValue('success');
      await processService.processMusicFromFile(
        mockData.userId,
        'fileName',
        'filePath',
      );
      expect(httpService.axiosRef.post).toHaveBeenCalled();
    });
    it('should throw error if error from axios', async () => {
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockRejectedValue(new BadRequestException('error'));
      await expect(
        processService.processMusicFromFile(
          mockData.userId,
          'fileName',
          'filePath',
        ),
      ).rejects.toThrow(new BadRequestException('error'));
    });
  });
  describe('checkProcessFile', () => {
    it('should return true if process is exist', async () => {
      jest
        .spyOn(prismaService.processedMusic, 'findFirst')
        .mockResolvedValue(mockData.processInfos[0]);
      const result = await processService.checkProcessFile(
        mockData.userId,
        mockData.processInfos[0].process_id,
      );
      expect(result).toBeTruthy();
    });
    it('should return false if process is null', async () => {
      jest
        .spyOn(prismaService.processedMusic, 'findFirst')
        .mockResolvedValue(null);
      const result = await processService.checkProcessFile(
        mockData.userId,
        mockData.processInfos[0].process_id,
      );
      expect(result).toBeFalsy();
    });
  });
  describe('deleteProcessFile', () => {
    it('should delete process file', async () => {
      jest
        .spyOn(prismaService.processedMusicExtract, 'findMany')
        .mockResolvedValue(mockData.processedExtracts);
      jest
        .spyOn(prismaService.processedMusicExtract, 'deleteMany')
        .mockImplementationOnce(jest.fn());
      jest
        .spyOn(prismaService.music, 'deleteMany')
        .mockImplementationOnce(jest.fn());
      jest
        .spyOn(prismaService.processedMusic, 'delete')
        .mockResolvedValue(mockData.processInfos[0]);
      const result = await processService.deleteProcessFile(
        mockData.processInfos[0].process_id,
      );
      expect(result).toEqual(mockData.processInfos[0]);
      expect(prismaService.processedMusicExtract.findMany).toHaveBeenCalled();
      expect(prismaService.processedMusicExtract.deleteMany).toHaveBeenCalled();
      expect(prismaService.music.deleteMany).toHaveBeenCalled();
      expect(prismaService.processedMusic.delete).toHaveBeenCalled();
    });
  });
});
