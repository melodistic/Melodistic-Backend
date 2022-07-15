import {
  Controller,
  Get
} from '@nestjs/common';
import { TrackService } from './track.service';
import {
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Track')
@Controller('track')
export class TrackController {
  constructor(private trackService: TrackService) {}

  @Get('')
  @ApiInternalServerErrorResponse()
  async getTrack(): Promise<any> {
    return this.trackService.getTrack();
  }

}
