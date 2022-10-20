import { CatRequestDto } from './dto/cats.request.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cat } from './cats.schema';
import { ReadonlyCatDto } from './dto/cat.dto';

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

  async findCatByIdWithoutPassword(
    id: Types.ObjectId,
  ): Promise<Cat | null> {
    const cat = await this.catModel.findById(id).select('-password');
    return cat;
  }

  async findByIdAndUpdateImg(
    id: string,
    fileName: string,
  ): Promise<ReadonlyCatDto> {
    const cat = await this.catModel.findById(id);
    cat.imgUrl = `http://localhost:8000/media/${fileName}`;
    const newCat = await cat.save();
    return newCat.readOnlyData;
  }

  async findAll() {
    return await this.catModel.find();
  }
}
