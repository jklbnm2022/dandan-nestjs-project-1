import { CatsRepository } from './cats.repository';
import { Cat, CatSchema } from './cats.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
    forwardRef(() => AuthModule),
  ],
  providers: [CatsService, CatsRepository],
  controllers: [CatsController],
  exports: [CatsService, CatsRepository],
})
export class CatsModule {}
