import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  HttpException,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { PositiveIntPipe } from '../common/pipes/positiveInt.pipe';
import { SuccessInterceptor } from 'src/common/interceptors/logging.interceptor';

@Controller('cats')
@UseInterceptors(SuccessInterceptor)
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  getAllCat() {
    throw new HttpException('api broken', 401);
    return 'all cat';
  }

  @Get(':id')
  getCat(@Param('id', ParseIntPipe, PositiveIntPipe) id: number) {
    return { id };
  }

  @Post()
  createCat() {
    return;
  }

  @Put(':id')
  updateCat() {
    return;
  }

  @Patch(':id')
  updatePartialCat() {
    return;
  }

  @Delete(':id')
  deleteCat() {
    return;
  }
}
