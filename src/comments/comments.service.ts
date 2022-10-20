import { Injectable, Type } from '@nestjs/common';
import { Types } from 'mongoose';
import { CatsRepository } from 'src/cats/cats.repository';
import { CommentsRepository } from './comments.repository';
import { CommentsCreateDto } from './dto/comments.create.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly catsRepository: CatsRepository,
  ) {}

  async getAllComments() {
    return await this.commentsRepository.getAllComment();
  }

  async createComment(
    id: Types.ObjectId,
    { contents, author }: CommentsCreateDto,
  ) {
    const targetCat = await this.catsRepository.findCatByIdWithoutPassword(id);

    const validatedAuthor =
      await this.catsRepository.findCatByIdWithoutPassword(author);

    return await this.commentsRepository.createComment(
      validatedAuthor._id,
      targetCat._id,
      contents,
    );
  }

  async plusLike(id: Types.ObjectId) {
    return await this.commentsRepository.plusLike(id);
  }
}
