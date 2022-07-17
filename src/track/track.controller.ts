import { BadRequestException, Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { TrackService } from './track.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async getTrackById(@User() userId, @Param('trackId') trackId): Promise<any> {
    try {
      const track = await this.trackService.getTrackById(userId, trackId);
      if (track) return track;
      throw new NotFoundException();
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
