import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { renameSync, rmSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { uploadPath, musicFileFilter } from '../config/file.config';
import { User } from '../decorators/user.decorator';
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
  @ApiOperation({ summary: 'Get Process Information' })
  @ApiOkResponse({ description: 'Successfully get process information' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({
    description: 'Fail to get process information',
  })
  async getProcessInformation(@User() userId: string): Promise<any> {
    try {
      const result = await this.processService.getProcessInformation(userId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Fail to get process information');
    }
  }

  @Post('/youtube')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process Music from Youtube URL' })
  @ApiCreatedResponse({ description: 'Processing started' })
  @ApiBadRequestResponse({ description: 'Fail to process track' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({ description: 'Fail to process track' })
  async processMusicFromYoutube(
    @User() userId: string,
    @Body() data: YoutubeDto,
  ): Promise<any> {
    try {
      await this.processService.processMusicFromYoutube(userId, data.url);
      return {
        statusCode: 201,
        message: 'Processing started',
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Fail to process track');
    }
  }

  @Post('/file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('music', {
      dest: uploadPath,
      fileFilter: musicFileFilter,
      limits: { fileSize: 100 << 20 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process Music from File' })
  @ApiCreatedResponse({ description: 'Processing started' })
  @ApiBadRequestResponse({ description: 'Fail to process track' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({ description: 'Fail to process track' })
  async processMusicFromFile(
    @User() userId: string,
    @Body() body: FileDto,
    @UploadedFile() music: Express.Multer.File,
  ): Promise<any> {
    try {
      const filename = music.originalname.split('.')[0];
      const fileExtension = music.originalname.split('.')[1];
      const newFilename = `${filename}-${Date.now()}.${fileExtension}`;
      const filePath = `${uploadPath}/${newFilename}`;
      renameSync(music.path, filePath);
      await this.processService.processMusicFromFile(
        userId,
        filename,
        filePath,
      );
      return {
        statusCode: 201,
        message: 'Processing started',
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException('Fail to process track');
    }
  }

  @Delete('/:processId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Process Information' })
  @ApiOkResponse({ description: 'Successfully delete process information' })
  @ApiNotFoundResponse({ description: 'Process information not found' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  @ApiInternalServerErrorResponse({
    description: 'Fail to delete process information',
  })
  async deleteProcessFile(
    @User() userId: string,
    @Param('processId') processId: string,
  ): Promise<any> {
    try {
      const isProcessExist = await this.processService.checkProcessFile(
        userId,
        processId,
      );
      if (!isProcessExist)
        throw new NotFoundException('Process information not found');
      const result = await this.processService.deleteProcessFile(processId);
      if (result != null) {
        rmSync('/app/song/processed/' + result.processed_id, {
          recursive: true,
          force: true,
        });
        rmSync('/app/features/processed/' + result.processed_id, {
          recursive: true,
          force: true,
        });
      }
      return result;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Fail to delete process information',
      );
    }
  }
}
