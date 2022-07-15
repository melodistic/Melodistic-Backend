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
}
