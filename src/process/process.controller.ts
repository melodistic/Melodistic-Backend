import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { renameSync } from 'fs';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { uploadPath, musicFileFilter } from 'src/config/file.config';
import { User } from 'src/decorators/user.decorator';
import { FileDto } from './dto/file.dto';
import { YoutubeDto } from './dto/youtube.dto';
import { ProcessService } from './process.service';

@ApiTags('Process')
@Controller('process')
export class ProcessController {
  constructor(private processService: ProcessService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiInternalServerErrorResponse()
  async getTrack(@User() userId: string): Promise<any> {
    return this.processService.getProcessInformation(userId);
  }

  @Post('/youtube')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiInternalServerErrorResponse()
  async processMusicFromYoutube(
    @User() userId: string,
    @Body() data: YoutubeDto,
  ): Promise<any> {
    await this.processService.processMusicFromYoutube(userId, data.url);
    return {
      statusCode: 200,
      message: 'Processing started',
    };
  }

  @Post('/file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('music', {
      dest: uploadPath,
      fileFilter: musicFileFilter,
      limits: { fileSize: 1 << 24 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiInternalServerErrorResponse()
  async processMusicFromFile(
    @User() userId: string,
    @Body() body: FileDto,
    @UploadedFile() music: Express.Multer.File,
  ): Promise<any> {
    const filename = music.originalname.split('.')[0];
    const fileExtension = music.originalname.split('.')[1];
    const newFilename = `${filename}-${Date.now()}.${fileExtension}`;
    const filePath = `${uploadPath}/${newFilename}`;
    renameSync(music.path, filePath);
    await this.processService.processMusicFromFile(userId, filename, filePath);
    return {
      statusCode: 200,
      message: 'Processing started',
    };
  }

  @Delete('/:processId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiInternalServerErrorResponse()
  async deleteProcessFile(
    @User() userId: string,
    @Param('processId') processId: string,
  ): Promise<any> {
    return this.processService.deleteProcessFile(userId, processId);
  }
}
