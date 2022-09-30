import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator'
import { UserFavoriteDto } from './dto/user-favorite.dto';
import { renameSync, mkdirSync, existsSync, createReadStream } from 'fs'
import { uploadPath, fileFilter } from '../config/file.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from './dto/upload-image.dto';
import { UserDurationDto } from './dto/duration.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get('library')
    @ApiBearerAuth()
    @ApiUnauthorizedResponse({ description: 'User is not logged in' })
    @ApiInternalServerErrorResponse()
    async getLibrary(@User() userId: string): Promise<any> {
        return this.userService.getUserLibrary(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('favorite')
    @ApiBearerAuth()
    @ApiUnauthorizedResponse({ description: 'User is not logged in' })
    @ApiInternalServerErrorResponse()
    async getFavorite(@User() userId: string): Promise<any> {
        return this.userService.getUserFavorite(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('favorite')
    @ApiBearerAuth()
    @ApiUnauthorizedResponse({ description: 'User is not logged in' })
    @ApiInternalServerErrorResponse()
    async toggleFavorite(@User() userId: string, @Body() favorite: UserFavoriteDto): Promise<any> {
        return this.userService.toggleFavorite(userId, favorite.track_id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('duration')
    @ApiBearerAuth()
    @ApiUnauthorizedResponse({ description: 'User is not logged in' })
    @ApiInternalServerErrorResponse()
    async updateExerciseDuration(@User() userId: string, @Body() body: UserDurationDto): Promise<any> {
      return this.userService.updateExerciseDuration(userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image', { dest: uploadPath, fileFilter, limits: { fileSize: 5 << 20 } }))
    @Post('image')
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @ApiUnauthorizedResponse({ description: 'User is not logged in' })
    @ApiInternalServerErrorResponse()
    @ApiUnsupportedMediaTypeResponse()
    async uploadProfileImage(@User() userId: string, @Body() body: UploadImageDto, @UploadedFile() file: Express.Multer.File): Promise<any> {
      try {
        const filename = `${userId}.${file.mimetype.split('/')[1]}`;
        const filepath = `${uploadPath}/user/${filename}`
        if(!existsSync(`${uploadPath}/user`)) {
          mkdirSync(`${uploadPath}/user`)
        }
        renameSync(file.path, filepath)
        const result = await this.userService.uploadImage(userId, `https://melodistic.me/api/storage/user-profile/${filename}`);
        return result;
      } catch (e) {
        throw new BadRequestException('Invalid image')
      }
    }
}