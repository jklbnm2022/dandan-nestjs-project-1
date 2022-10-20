import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Cat } from 'src/cats/cats.schema';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { ParseObjectIdPipe } from 'src/common/pipes/parseStringToObjectId.pipe';
import { CommentsService } from './comments.service';
import { CommentsCreateDto } from './dto/comments.create.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: '모든 고양이 프로핏 댓글 가져오기' })
  @Get()
  getAllComments() {
    return this.commentsService.getAllComments();
  }

  @ApiOperation({ summary: '댓글 달기' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id')
  createComment(
    @CurrentUser() cat: Cat,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: CommentsCreateDto,
  ) {
    return this.commentsService.createComment(id, cat, body);
  }

  @ApiOperation({ summary: '좋아요 수 올리기' })
  @Get(':id')
  async plusLike(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.commentsService.plusLike(id);
  }
}
