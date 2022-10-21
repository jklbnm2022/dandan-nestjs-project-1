import { CatsRepository } from './cats.repository';
import { Cat, CatSchema } from './cats.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { CatsService } from './services/cats.service';
import { CatsController } from './controllers/cats.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { Comments, CommentsSchema } from 'src/comments/comments.schema';
import * as multer from 'multer';
import { AwsService } from 'src/aws/aws.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cat.name, schema: CatSchema },
      { name: Comments.name, schema: CommentsSchema },
    ]),
    forwardRef(() => AuthModule),
    MulterModule.register({
      // destination
      dest: './upload',
      storage: multer.memoryStorage()
    }),
  ],
  providers: [CatsService, CatsRepository, AwsService],
  controllers: [CatsController],
  exports: [CatsService, CatsRepository],
})
export class CatsModule {}
