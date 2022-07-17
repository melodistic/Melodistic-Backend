import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  async getTrack(): Promise<any> {
    return await this.prisma.track.findMany({
        where: {
          is_public: true,
        }
    })
  }

  async getTrackById(userId: string, trackId: string): Promise<any> {
    const publicTrack = await this.prisma.track.findFirst({
        where: {
          track_id: trackId,
          OR: [
            { is_public: true },
          ]
        }
    })
    if (publicTrack) return publicTrack
    const privateTrack = await this.prisma.generatedTrack.findFirst({
        where: {
          track_id: trackId,
          user_id: userId,
        },
        include: {
          Track: true,
        }
    })
    if (privateTrack) return privateTrack.Track
    return null
  }
}
