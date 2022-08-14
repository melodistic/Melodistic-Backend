import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import { unlinkSync, renameSync, existsSync, mkdirSync } from 'fs';

@ApiTags('Track')
@Controller('track')
export class TrackController {
  constructor(private trackService: TrackService) {}

  @Get('')
  @ApiInternalServerErrorResponse()
  async getTrack(): Promise<any> {
    return this.trackService.getTrack();
  }

  @Get(':trackId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'trackId' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async getTrackById(
    @User() userId: string,
    @Param('trackId') trackId: string,
  ): Promise<any> {
    try {
      const track = await this.trackService.getTrackById(userId, trackId);
      if (track) return track;
      throw new NotFoundException();
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async createTrack(
    @User() userId: string,
    @Body() track: CreateTrackDto
  ): Promise<any> {
    try {
      const createdTrack = await this.trackService.createTrack(userId, track);
      return createdTrack;
    } catch (error) {
      throw new BadRequestException();
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
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
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
      throw new NotFoundException();
    }
    try {
      const updatedTrack = await this.trackService.updateTrackImage(
        trackId,
        programImage.mimetype.split('/')[1],
      );
      const filepath = `${uploadPath}/track/${trackId}.${programImage.mimetype.split('/')[1]}`
      if(!existsSync(`${uploadPath}/track`)) {
        mkdirSync(`${uploadPath}/track`)
      }
      renameSync(programImage.path, filepath)
      return updatedTrack;
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
