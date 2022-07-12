import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { UserFavoriteDto } from './dto/user-favorite.dto';

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
}