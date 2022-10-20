import { CatRequestDto } from './dto/cats.request.dto';
import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  Body,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { SuccessInterceptor } from 'src/common/interceptors/logging.interceptor';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReadonlyCatDto } from './dto/cat.dto';
import { AuthService } from 'src/auth/auth.service';
import { LoginRequestDto } from 'src/auth/dto/login.request';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { Cat } from './cats.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/utils/multer.options';

@Controller('cats')
@UseInterceptors(SuccessInterceptor)
export class CatsController {
  constructor(
    private readonly catsService: CatsService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: '현재 고양이 정보 가져오기' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  getCurrentCat(@CurrentUser() cat: Cat) {
    return cat.readOnlyData;
  }

  @ApiResponse({
    status: 500,
    description: 'Server Error',
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: ReadonlyCatDto,
  })
  @ApiOperation({ summary: '회원가입' })
  @Post()
  async signUp(@Body() body: CatRequestDto) {
    return await this.catsService.signUp(body);
  }

  @ApiOperation({ summary: '로그인' })
  @Post('login')
  logIn(@Body() data: LoginRequestDto) {
    return this.authService.jwtLogIn(data);
  }

  @ApiOperation({ summary: '로그아웃' })
  @Post('logout')
  logOut() {
    return 'logout';
  }

  @ApiOperation({ summary: '고양이 이미지 업로드' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('image', 10, multerOptions('cats')))
  @Post('upload')
  uploadCatImg(
    @CurrentUser() cat: Cat,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.catsService.uploadImg(cat, files);
  }

  @ApiOperation({ summary: '모든 고양이 가져오기' })
  @Get('all')
  getAllCat() {
    return this.catsService.getAllCat();
  }
}
