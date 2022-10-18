import { CatRequestDto } from './dto/cats.request.dto';
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
  Body,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { PositiveIntPipe } from '../common/pipes/positiveInt.pipe';
import { SuccessInterceptor } from 'src/common/interceptors/logging.interceptor';
import { ApiOperation } from '@nestjs/swagger';

@Controller('cats')
@UseInterceptors(SuccessInterceptor)
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  getCurrentCat() {
    throw new HttpException('api broken', 401);
    return 'all cat';
  }

  @ApiOperation({ summary: '회원가입' })
  @Post()
  async signUp(@Body() body: CatRequestDto) {
    console.log(body);
    return await this.catsService.signUp(body);
  }

  @Post('login')
  logIn() {
    return 'logIn cat';
  }

  @Post('logout')
  logOut() {
    return 'logout';
  }

  @Post('upload/cats')
  uploadCatImg() {
    return 'uploadImg';
  }

  @Get(':id')
  getCat(@Param('id', ParseIntPipe, PositiveIntPipe) id: number) {
    return { id };
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
