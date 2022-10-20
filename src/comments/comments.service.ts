import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor() {}

  async getAllComments() {}

  async createComment(id: string, body: any) {}
}
