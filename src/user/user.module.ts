import { Module } from '@nestjs/common';
import { PreprocessorService } from '../utils/preprocessor.service';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TrackModule } from 'src/track/track.module';

@Module({
  imports: [TrackModule],
  providers: [UserService, PrismaService, PreprocessorService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
