import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PreprocessorService } from 'src/utils/preprocessor.service'
import { PrismaService } from '../prisma.service'
import { TrackController } from './track.controller'
import { TrackService } from './track.service'

@Module({
	imports: [HttpModule.register({
		timeout: 60000,
		maxRedirects: 5,
	  }),],
	providers: [TrackService, PrismaService, PreprocessorService],
	controllers: [TrackController],
	exports: [TrackService],
})
export class TrackModule {}