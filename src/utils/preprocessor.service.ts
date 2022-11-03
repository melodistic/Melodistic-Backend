import { Injectable } from '@nestjs/common';
import { Track, UserFavorite } from '@prisma/client';

@Injectable()
export class PreprocessorService {
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
  preprocessUserFavoriteTrack(userFavTrack: any): any {
    return userFavTrack.map(
      (
        track: {
          Track: {
            track_id: string;
            track_name: string;
            track_image_url: string;
            track_path: string;
            description: string;
            duration: number;
          };
        }[],
      ) => ({ ...track['Track'], is_favorite: true }),
    );
  }
}
