import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import * as fs from 'fs';
import { Decimal } from '@prisma/client/runtime';
import { Readable } from 'stream';

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
  processId: '1',
  youtubeDto: {
    url: 'https://www.youtube.com/watch?v=1',
  },
  fileDto: {
    music: 'test',
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

jest.mock('./process.service');
describe('Process Controller', () => {
  let processController: ProcessController;
  let processService: ProcessService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProcessController],
      providers: [ProcessService],
    }).compile();
    processController = moduleRef.get(ProcessController);
    processService = moduleRef.get(ProcessService);
  });
  beforeEach(() => {
    jest.spyOn(fs, 'renameSync');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('Get Process Information', () => {
    it('should return processed music information', async () => {
      jest
        .spyOn(processService, 'getProcessInformation')
        .mockResolvedValue(mockData.processInfos);
      const result = await processController.getProcessInformation(
        mockData.userId,
      );
      expect(result).toBe(mockData.processInfos);
      expect(processService.getProcessInformation).toHaveBeenCalled();
    });
    it('should throw an error', async () => {
      jest
        .spyOn(processService, 'getProcessInformation')
        .mockRejectedValue('error');
      await expect(
        processController.getProcessInformation(mockData.userId),
      ).rejects.toThrow(
        new InternalServerErrorException('Fail to get process information'),
      );
    });
  });
  describe('Process Music from Youtube URL', () => {
    it('should start process', async () => {
      jest
        .spyOn(processService, 'processMusicFromYoutube')
        .mockImplementationOnce(jest.fn());
      const result = await processController.processMusicFromYoutube(
        mockData.userId,
        mockData.youtubeDto,
      );
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Processing started');
      expect(processService.processMusicFromYoutube).toHaveBeenCalled();
    });
    it('should throw an error', async () => {
      jest
        .spyOn(processService, 'processMusicFromYoutube')
        .mockRejectedValue('error');
      await expect(
        processController.processMusicFromYoutube(
          mockData.userId,
          mockData.youtubeDto,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException('Fail to process track'),
      );
      expect(processService.processMusicFromYoutube).toHaveBeenCalled();
    });
  });
  describe('Process Music from File', () => {
    it('should start process', async () => {
      jest
        .spyOn(processService, 'processMusicFromFile')
        .mockImplementationOnce(jest.fn());
      const result = await processController.processMusicFromFile(
        mockData.userId,
        mockData.fileDto,
        mockData.file,
      );
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Processing started');
      expect(processService.processMusicFromFile).toHaveBeenCalled();
    });
    it('should throw an error', async () => {
      jest
        .spyOn(processService, 'processMusicFromFile')
        .mockRejectedValue('error');
      await expect(
        processController.processMusicFromFile(
          mockData.userId,
          mockData.fileDto,
          mockData.file,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException('Fail to process track'),
      );
      expect(processService.processMusicFromFile).toHaveBeenCalled();
    });
  });
  describe('Delete Processed Music', () => {
    it('should delete processed music', async () => {
      jest
        .spyOn(processService, 'checkProcessFile')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(processService, 'deleteProcessFile')
        .mockResolvedValueOnce(mockData.processInfos[0]);
      const result = await processController.deleteProcessFile(
        mockData.userId,
        mockData.processId,
      );
      expect(result).toBe(mockData.processInfos[0]);
      expect(processService.checkProcessFile).toHaveBeenCalled();
      expect(processService.deleteProcessFile).toHaveBeenCalled();
    });
    it('should throw an error if process information not found', async () => {
      jest
        .spyOn(processService, 'checkProcessFile')
        .mockResolvedValueOnce(false);
      await expect(
        processController.deleteProcessFile(
          mockData.userId,
          mockData.processId,
        ),
      ).rejects.toThrow(new NotFoundException('Process information not found'));
      expect(processService.checkProcessFile).toHaveBeenCalled();
    });
    it('should throw an error if fail to delete process information', async () => {
      jest
        .spyOn(processService, 'checkProcessFile')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(processService, 'deleteProcessFile')
        .mockRejectedValueOnce('error');
      await expect(
        processController.deleteProcessFile(
          mockData.userId,
          mockData.processId,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException('Fail to delete process information'),
      );
      expect(processService.checkProcessFile).toHaveBeenCalled();
      expect(processService.deleteProcessFile).toHaveBeenCalled();
    });
  });
});
