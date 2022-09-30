import { Injectable } from '@nestjs/common';
import { PreprocessorService } from 'src/utils/preprocessor.service';
import { PrismaService } from '../prisma.service';
import { UserDurationDto } from './dto/duration.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private preprocessorSerivce: PreprocessorService) {}

  async findUserById(userId: string): Promise<any> {
    return await this.prisma.user.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        user_id: true,
        email: true,
        user_profile_image: true,
        exercise_duration_hour: true,
        exercise_duration_minute: true
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
    const userLibraryTrack = await this.prisma.$queryRaw`SELECT * FROM get_library(${userId});`;
    return userLibraryTrack;
  }

  async getUserFavorite(userId: string): Promise<any> {
    const userFavTrack = await this.prisma.userFavorite.findMany({
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
    return this.preprocessorSerivce.preprocessUserFavoriteTrack(userFavTrack);
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

  async updateExerciseDuration(userId: string, duration: UserDurationDto): Promise<any> {
    await this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        exercise_duration_hour: duration.duration_hour,
        exercise_duration_minute: duration.duration_minute,
      },
    });
    return {
      status: 200,
      message: 'Exercise duration updated',
    };
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
      message: 'Profile image updated',
    };
  }
}
