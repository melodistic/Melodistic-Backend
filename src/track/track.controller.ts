import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrackService } from './track.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../decorators/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTrackDto } from './dto/create-tack.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadPath, fileFilter } from '../config/file.config';
import { UpdateImageDto } from './dto/update-image.dto';
import { unlinkSync, renameSync, existsSync, mkdirSync, rmSync } from 'fs';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@ApiTags('Track')
@Controller('track')
export class TrackController {
  constructor(private trackService: TrackService) {}

  @Get('')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Public Track' })
  @ApiOkResponse({ description: 'Successfully get public track' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({ description: 'Fail to get Track' })
  async getTrack(@User() userId: string): Promise<any> {
    try {
      if (userId != null) {
        return this.trackService.getTrackWithFavorite(userId);
      }
      return this.trackService.getTrack();
    } catch (error) {
      throw new InternalServerErrorException('Fail to get Track');
    }
  }

  @Get(':trackId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'trackId' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Public Track' })
  @ApiOkResponse({ description: 'Successfully get track by id' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiNotFoundResponse({ description: 'Track not found' })
  @ApiInternalServerErrorResponse({ description: 'Fail to get Track' })
  async getTrackById(
    @User() userId: string,
    @Param('trackId') trackId: string,
  ): Promise<any> {
    try {
      const track = await this.trackService.getTrackById(userId, trackId);
      if (!track) throw new NotFoundException('Track not found');
      return track;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Fail to get Track');
    }
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Track' })
  @ApiOkResponse({ description: 'Successfully create track' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({ description: 'Fail to create Track' })
  async createTrack(
    @User() userId: string,
    @Body() track: CreateTrackDto,
  ): Promise<any> {
    try {
      const createdTrack = await this.trackService.createTrack(userId, track);
      return createdTrack;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Fail to create Track');
    }
  }

  @Post(':trackId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('program_image', {
      dest: uploadPath,
      fileFilter,
      limits: { fileSize: 5 << 20 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Track' })
  @ApiOkResponse({ description: 'Successfully update track image' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiNotFoundResponse({ description: 'Track not found' })
  @ApiInternalServerErrorResponse({ description: 'Fail to delete Track' })
  async updateTrackImage(
    @User() userId,
    @Body() body: UpdateImageDto,
    @Param('trackId') trackId: string,
    @UploadedFile() programImage: Express.Multer.File,
  ): Promise<any> {
    const existingTrack = await this.trackService.checkUserTrack(
      userId,
      trackId,
    );
    if (!existingTrack) {
      unlinkSync(programImage.path);
      throw new NotFoundException('Track not found');
    }
    try {
      const updatedTrack = await this.trackService.updateTrackImage(
        trackId,
        programImage.mimetype.split('/')[1],
      );
      const filepath = `${uploadPath}/track/${trackId}.${
        programImage.mimetype.split('/')[1]
      }`;
      if (!existsSync(`${uploadPath}/track`)) {
        mkdirSync(`${uploadPath}/track`);
      }
      renameSync(programImage.path, filepath);
      return updatedTrack;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Fail to update Track');
    }
  }

  @Delete(':trackId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'trackId' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Track' })
  @ApiOkResponse({ description: 'Track deleted' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiNotFoundResponse({ description: 'Track not found' })
  @ApiInternalServerErrorResponse({ description: 'Fail to delete Track' })
  async deleteTrack(
    @User() userId: string,
    @Param('trackId') trackId: string,
  ): Promise<any> {
    const existsTrack = await this.trackService.checkExistTrack(trackId);
    if (!existsTrack) throw new NotFoundException('Track not found');
    const track = await this.trackService.checkUserTrack(userId, trackId);
    if (!track) throw new NotFoundException('Track not found');
    try {
      await this.trackService.deleteGeneratedTrack(userId, trackId);
      await this.trackService.deleteFavoriteTrack(userId, trackId);
      await this.trackService.deleteTrack(trackId);
      rmSync('/app/combine-result' + trackId + '.wav', {
        recursive: true,
        force: true,
      });
      return { status: 200, message: 'Track deleted' };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Fail to delete Track');
    }
  }
}
