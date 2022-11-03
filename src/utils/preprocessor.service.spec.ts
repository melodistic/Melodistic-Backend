import { Test } from '@nestjs/testing';
import { PreprocessorService } from './preprocessor.service';

const mockData = {
  preprocessFavoriteTrack: {
    input: [
      {
        track_id: 'track_id',
        track_name: 'track_name',
        track_image_url: 'track_image_url',
        track_path: 'track_path',
        description: 'description',
        duration: 100,
        UserFavorite: [{ user_id: 'user_id' }],
      },
    ],
    output: [
      {
        track_id: 'track_id',
        track_name: 'track_name',
        track_image_url: 'track_image_url',
        track_path: 'track_path',
        description: 'description',
        duration: 100,
        is_favorite: true,
      },
    ],
  },
  preprocessUserFavoriteTrack: {
    input: [
      {
        Track: {
          track_id: 'track_id',
          track_name: 'track_name',
          track_image_url: 'track_image_url',
          track_path: 'track_path',
          description: 'description',
          duration: 100,
        },
      },
    ],
    output: [
      {
        track_id: 'track_id',
        track_name: 'track_name',
        track_image_url: 'track_image_url',
        track_path: 'track_path',
        description: 'description',
        duration: 100,
        is_favorite: true,
      },
    ],
  },
};
describe('Preprocess Service', () => {
  let preprocessorService: PreprocessorService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PreprocessorService],
    }).compile();
    preprocessorService = moduleRef.get(PreprocessorService);
  });
  it('preprocessFavoriteTrack should return track with is_favorite', async () => {
    const result = preprocessorService.preprocessFavoriteTrack(
      mockData.preprocessFavoriteTrack.input,
    );
    expect(result).toStrictEqual(mockData.preprocessFavoriteTrack.output);
    expect(result[0].is_favorite).toBe(true);
  });
  it('preprocessUserFavoriteTrack should return track with is_favorite', async () => {
    const result = preprocessorService.preprocessUserFavoriteTrack(
      mockData.preprocessUserFavoriteTrack.input,
    );
    expect(result).toStrictEqual(mockData.preprocessUserFavoriteTrack.output);
    expect(result[0].is_favorite).toBe(true);
  });
});
