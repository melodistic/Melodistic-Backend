import { Module } from '@nestjs/common'
import { PreprocessorService } from '../utils/preprocessor.service'
import { PrismaService } from '../prisma.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { TrackService } from 'src/track/track.service'

@Module({
	providers: [UserService,PrismaService, PreprocessorService],
	controllers: [UserController],
	exports: [UserService, TrackService],
})
export class UserModule {}