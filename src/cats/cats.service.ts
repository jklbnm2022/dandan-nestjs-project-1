import { Cat } from './cats.schema';
import { CatRequestDto } from './dto/cats.request.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  async signUp(dto: CatRequestDto) {
    const { email, password, name } = dto;

    // 이메일 중복 검사
    const isCatExist = await this.catModel.exists({ email });
    if (isCatExist) {
      throw new ConflictException('이미 사용중인 이메일입니다.');
    }

    // 패스워드 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const cat = await this.catModel.create({
      name,
      password: hashedPassword,
      email,
    });

    return cat.readOnlyData;
  }
}
