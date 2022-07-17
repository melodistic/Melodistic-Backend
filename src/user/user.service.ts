import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserById(userId: string): Promise<any> {
    return await this.prisma.user.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        user_id: true,
        email: true,
        user_profile_image: true,
      },
    });
  }

  async findUserByEmail(email: string): Promise<any> {
    return await this.prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        user_id: true,
        email: true,
      },
    });
  }

  async getUserLibrary(userId: string): Promise<any> {
    return await this.prisma.generatedTrack.findMany({
      select: {
        Track: {
          select: {
            track_id: true,
            track_name: true,
            track_image_url: true,
            track_path: true,
            description: true,
            duration: true,
          },
        },
      },
      where: {
        user_id: userId,
      },
      orderBy: {
        Track: {
          created_at: 'desc',
        },
      },
    });
  }

  async getUserFavorite(userId: string): Promise<any> {
    return await this.prisma.userFavorite.findMany({
      select: {
        Track: {
          select: {
            track_id: true,
            track_name: true,
            track_image_url: true,
            track_path: true,
            description: true,
            duration: true,
          },
        },
      },
      where: {
        user_id: userId,
      },
      orderBy: {
        Track: {
          created_at: 'desc',
        },
      },
    });
  }

  async toggleFavorite(userId: string, trackId: string): Promise<any> {
    const existFavorite = await this.prisma.userFavorite.findFirst({
      where: {
        user_id: userId,
        track_id: trackId,
      },
    });
    if (existFavorite) {
      await this.prisma.userFavorite.delete({
        where: {
          user_favorite_id: existFavorite.user_favorite_id,
        },
      });
      return {
        status: 200,
        message: 'Track removed from favorite',
      };
    } else {
      await this.prisma.userFavorite.create({
        data: {
          user_id: userId,
          track_id: trackId,
        },
      });
      return {
        status: 201,
        message: 'Track added to favorite',
      };
    }
  }

  async uploadImage(userId: string, image: string): Promise<any> {
    await this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        user_profile_image: image,
      },
    });
    return {
      status: 200,
      message: 'Image uploaded',
    };
  }
}
