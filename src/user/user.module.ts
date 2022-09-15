import { Module } from '@nestjs/common'
import { PreprocessorService } from 'src/utils/preprocessor.service'
import { PrismaService } from '../prisma.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	providers: [UserService,PrismaService, PreprocessorService],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}