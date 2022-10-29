import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

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
      }
    });
  }
  async processMusicFromYoutube(
    userId: string,
    youtubeUrl: string,
  ): Promise<any> {
    const video_id = youtubeUrl.includes('v=')
      ? youtubeUrl.split('v=')[1]
      : youtubeUrl.split('be/')[1];
    await this.httpService.axiosRef.post(
      'https://melodistic.me/api/processor/youtube',
      {
        user_id: userId,
        video_id: video_id,
      },
    );
  }
  async processMusicFromFile(
    userId: string,
    file_name: string,
    file_path: string,
  ): Promise<any> {
    await this.httpService.axiosRef.post(
      'https://melodistic.me/api/processor/file',
      {
        user_id: userId,
        file_name: file_name,
        file_path: file_path,
      },
    );
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
  async deleteProcessFile(userId: string, processId: string): Promise<any> {
    const isProcessExist = await this.checkProcessFile(userId, processId);
    if (!isProcessExist) throw new NotFoundException('Process not found');

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
