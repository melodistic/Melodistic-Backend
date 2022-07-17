import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { UserFavoriteDto } from './dto/user-favorite.dto';
import { renameSync } from 'fs'
import { uploadPath, fileFilter } from '../config/file.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from './dto/upload-image.dto';

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
    @UseInterceptors(FileInterceptor('image', { dest: uploadPath, fileFilter, limits: { fileSize: 5 << 20 } }))
    @Post('image')
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @ApiUnauthorizedResponse({ description: 'User is not logged in' })
    @ApiInternalServerErrorResponse()
    @ApiUnsupportedMediaTypeResponse()
    async uploadProfileImage(@User() userId: string, @Body() body: UploadImageDto, @UploadedFile() file: Express.Multer.File): Promise<any> {
      try {
        const filepath = `${uploadPath}/user/${userId}.${file.mimetype.split('/')[1]}`
        renameSync(file.path, filepath)
        return this.userService.uploadImage(userId, filepath);
      } catch (e) {
        throw new BadRequestException('Invalid image')
      }
    }
}