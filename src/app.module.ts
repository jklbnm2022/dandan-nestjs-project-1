import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import * as mongoose from 'mongoose';
import { CommentsModule } from './comments/comments.module';
import { AwsService } from './aws.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      `${process.env.MONGO_URL_PREFIX}${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}${process.env.MONGO_URL_SUFFIX}${process.env.MONGO_DATABASE}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    ),
    CatsModule,
    AuthModule,
    CommentsModule
  ],
  controllers: [AppController],
  providers: [AppService, AwsService],
})
export class AppModule implements NestModule {
  private readonly isDev: boolean = process.env.MODE === 'dev';
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    mongoose.set('debug', this.isDev);
  }
}
