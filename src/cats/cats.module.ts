import { CatsRepository } from './cats.repository';
import { Cat, CatSchema } from './cats.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { CatsService } from './services/cats.service';
import { CatsController } from './controllers/cats.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { Comments, CommentsSchema } from 'src/comments/comments.schema';

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
    }),
  ],
  providers: [CatsService, CatsRepository],
  controllers: [CatsController],
  exports: [CatsService, CatsRepository],
})
export class CatsModule {}
