import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
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
    this.processService.processMusicFromYoutube(userId, data.url);
    return {
        statusCode: 200,
        message: 'Processing started'
    }
  }

  @Post('/file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiInternalServerErrorResponse()
  async processMusicFromFile(@User() userId: string): Promise<any> {
    // Add File Upload here
    // return this.processService.processMusicFromFile(userId, data.url);
    return {
        statusCode: 200,
        message: 'Processing started'
    }
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
