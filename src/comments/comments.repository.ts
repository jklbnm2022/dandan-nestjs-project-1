import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comments } from './comments.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comments.name) private readonly commentModel: Model<Comments>,
  ) {}

  async getAllComment() {
    return await this.commentModel.find();
  }

  async createComment(
    author: Types.ObjectId,
    info: Types.ObjectId,
    contents: string,
  ) {
    const comment = await this.commentModel.create({
      author,
      contents,
      info,
    });
    return await comment.save();
  }

  async plusLike(id: Types.ObjectId) {
    const comment = await this.commentModel.findById(id);
    comment.likeCount += 1;
    await comment.save();
    return comment;
  }
}
