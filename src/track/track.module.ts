import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TrackController } from './track.controller'
import { TrackService } from './track.service'

@Module({
	providers: [TrackService, PrismaService],
	controllers: [TrackController],
	exports: [TrackService],
})
export class TrackModule {}