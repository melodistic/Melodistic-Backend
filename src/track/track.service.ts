import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Track, UserFavorite } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTrackDto } from './dto/create-tack.dto';

@Injectable()
export class TrackService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  preprocessFavoriteTrack(favoriteTrack: any): any {
    return favoriteTrack.map(
      (
        track: Track & {
          UserFavorite: UserFavorite[];
        },
      ) => {
        const isFav = track.UserFavorite.length > 0;
        delete track.UserFavorite;
        return {
          ...track,
          is_favorite: isFav,
        };
      },
    );
  }

  async getTrack(): Promise<any> {
    const publicTrack = await this.prisma.track.findMany({
      where: {
        is_public: true,
      },
    });
    return publicTrack;
  }

  async getTrackWithFavorite(userId: string): Promise<any> {
    const favoriteTrack = await this.prisma.track.findMany({
      where: {
        is_public: true,
      },
      include: {
        UserFavorite: {
          where: {
            user_id: userId,
          },
        },
      },
    });
    const modifiedFavoriteTrack = this.preprocessFavoriteTrack(favoriteTrack);
    return modifiedFavoriteTrack;
  }

  async getTrackById(userId: string, trackId: string): Promise<any> {
    const publicTrack = await this.prisma.track.findFirst({
      where: {
        track_id: trackId,
        OR: [{ is_public: true }],
      },
    });
    if (publicTrack) return publicTrack;
    const privateTrack = await this.prisma.generatedTrack.findFirst({
      where: {
        track_id: trackId,
        user_id: userId,
      },
      include: {
        Track: true,
      },
    });
    if (privateTrack) return privateTrack.Track;
    return null;
  }

  async createTrack(userId: string, track: CreateTrackDto): Promise<any> {
    const response = await this.httpService.axiosRef.post(
      'https://melodistic-aks.ggolfz.me/api/generate',
      {
        program_name: track.program_name,
        muscle_group: track.muscle_group,
        sections: track.sections,
      },
    );
    await this.prisma.generatedTrack.create({
      data: {
        user_id: userId,
        track_id: response.data.track_id,
      },
    });
    return {
      status: 200,
      message: 'Track created successfully',
      track_id: response.data.track_id,
    };
  }

  async checkUserTrack(userId: string, trackId: string): Promise<any> {
    const result = await this.prisma.generatedTrack.findFirst({
      where: {
        track_id: trackId,
        user_id: userId,
      },
    });
    return result;
  }

  async updateTrackImage(trackId: string, fileExt: string): Promise<any> {
    const result = await this.prisma.track.update({
      where: {
        track_id: trackId,
      },
      data: {
        track_image_url: `https://melodistic.ggolfz.me/api/track-images/${trackId}.${fileExt}`,
      },
    });
    return result;
  }
}
