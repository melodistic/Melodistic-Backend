import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserFavoriteDto } from './dto/user-favorite.dto';
import { renameSync, mkdirSync, existsSync, createReadStream } from 'fs';
import { uploadPath, fileFilter } from '../config/file.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from './dto/upload-image.dto';
import { UserDurationDto } from './dto/duration.dto';
import { TrackService } from '../track/track.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private trackService: TrackService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('library')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Library' })
  @ApiOkResponse({ description: 'Successfully getting user library tracks' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async getLibrary(@User() userId: string): Promise<any> {
    try {
      const libraryTracks = await this.userService.getUserLibrary(userId);
      return libraryTracks;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Favorite' })
  @ApiOkResponse({ description: 'Successfully get user favorite tracks' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async getFavorite(@User() userId: string): Promise<any> {
    try {
      const favoriteTracks = await this.userService.getUserFavorite(userId);
      return favoriteTracks;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle Favorite' })
  @ApiOkResponse({ description: 'Track removed from favorite' })
  @ApiCreatedResponse({ description: 'Track added to favorite' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiNotFoundResponse({ description: 'Track not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async toggleFavorite(
    @User() userId: string,
    @Body() favorite: UserFavoriteDto,
  ): Promise<any> {
    try {
      const existsTrack = await this.trackService.checkExistTrack(favorite.track_id);
      if (!existsTrack) {
        throw new NotFoundException('Track not found');
      }
      const result = await this.userService.toggleFavorite(
        userId,
        favorite.track_id,
      );
      return result;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('duration')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set Exercise Duration' })
  @ApiOkResponse({ description: 'Exercise duration updated' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async updateExerciseDuration(
    @User() userId: string,
    @Body() body: UserDurationDto,
  ): Promise<any> {
    try {
      await this.userService.updateExerciseDuration(userId, body);
      return {
        status: 200,
        message: 'Exercise duration updated',
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      dest: uploadPath,
      fileFilter,
      limits: { fileSize: 5 << 20 },
    }),
  )
  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Profile Image' })
  @ApiOkResponse({ description: 'Profile image is updated' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiUnsupportedMediaTypeResponse({ description: 'Unsupported Media Type' })
  async uploadProfileImage(
    @User() userId: string,
    @Body() body: UploadImageDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      const filename = `${userId}.${file.mimetype.split('/')[1]}`;
      const filepath = `${uploadPath}/user/${filename}`;
      if (!existsSync(`${uploadPath}/user`)) {
        mkdirSync(`${uploadPath}/user`);
      }
      renameSync(file.path, filepath);
      await this.userService.uploadImage(
        userId,
        `https://melodistic.me/api/storage/user-profile/${filename}`,
      );
      return {
        status: 200,
        message: 'Profile image updated',
      };
    } catch (e) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
