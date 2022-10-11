import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PreprocessorService } from 'src/utils/preprocessor.service'
import { PrismaService } from '../prisma.service'
import { ProcessController } from './process.controller'
import { ProcessService } from './process.service'
@Module({
	imports: [HttpModule.register({
		timeout: 60000,
		maxRedirects: 5,
	  }),],
	providers: [ProcessService, PrismaService],
	controllers: [ProcessController],
	exports: [ProcessService],
})
export class TrackModule {}