import { CatRequestDto } from './dto/cats.request.dto';
import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cat } from './cats.schema';

@Injectable()
export class CatsRepository {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  async existsByEmail(email: string): Promise<boolean> {
    const isCatExist = await this.catModel.exists({ email });
    return Boolean(isCatExist);
  }

  async createUser({ name, password, email }: CatRequestDto) {
    const cat = await this.catModel.create({
      name,
      password,
      email,
    });
    return cat.readOnlyData;
  }

  async findCatByEmail(email): Promise<Cat | null> {
    const cat = await this.catModel.findOne({ email });
    return cat;
  }

  async findCatByIdWithoutPassword(id: string): Promise<Cat | null> {
    const cat = await this.catModel.findById(id).select('-password');
    return cat;
  }
}
