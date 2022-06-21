import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';

class PingResponseDto {
  @ApiProperty()
  message: string

  @ApiProperty()
  timestamp: Date
}

@Controller()
export class AppController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'healthcheck' })
  @ApiOkResponse({ type: PingResponseDto})
  getHello() {
    return {
      message: 'pong',
      timestamp: new Date()
    }
  }
}
