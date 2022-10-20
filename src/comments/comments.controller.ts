import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Types } from 'mongoose';
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

  @ApiOperation({ summary: '모든 고양이 프로핏 댓글 가져오기' })
  @Post(':id')
  createComment(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: CommentsCreateDto,
  ) {
    return this.commentsService.createComment(id, body);
  }

  @ApiOperation({ summary: '좋아요 수 올리기' })
  @Post(':id')
  async plusLike(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.commentsService.plusLike(id);
  }
}
