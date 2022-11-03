import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProcessService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}
  async getProcessInformation(userId: string): Promise<any> {
    return this.prisma.processedMusic.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }
  async processMusicFromYoutube(
    userId: string,
    youtubeUrl: string,
  ): Promise<any> {
    const video_id = youtubeUrl.includes('v=')
      ? youtubeUrl.split('v=')[1]
      : youtubeUrl.split('be/')[1];
    try {
      await this.httpService.axiosRef.post(
        'https://melodistic.me/api/processor/youtube',
        {
          user_id: userId,
          video_id: video_id,
        },
      );
    } catch (error) {
      if (error.response.data) {
        throw new BadRequestException(error.response.data.message);
      }
      throw error;
    }
  }
  async processMusicFromFile(
    userId: string,
    file_name: string,
    file_path: string,
  ): Promise<any> {
    try {
      await this.httpService.axiosRef.post(
        'https://melodistic.me/api/processor/file',
        {
          user_id: userId,
          file_name: file_name,
          file_path: file_path,
        },
      );
    } catch (error) {
      if (error.response.data) {
        throw new BadRequestException(error.response.data.message);
      }
      throw error;
    }
  }
  async checkProcessFile(userId: string, processId: string): Promise<boolean> {
    const existProcess = await this.prisma.processedMusic.findFirst({
      where: {
        user_id: userId,
        process_id: processId,
      },
    });
    return existProcess != null;
  }
  async deleteProcessFile(processId: string): Promise<any> {
    const musicIdList = (
      await this.prisma.processedMusicExtract.findMany({
        where: {
          processed_id: processId,
        },
      })
    ).map((music) => music.music_id);
    await this.prisma.processedMusicExtract.deleteMany({
      where: {
        processed_id: processId,
      },
    });
    await this.prisma.music.deleteMany({
      where: {
        music_id: {
          in: musicIdList,
        },
      },
    });
    return this.prisma.processedMusic.delete({
      where: {
        process_id: processId,
      },
    });
  }
}
