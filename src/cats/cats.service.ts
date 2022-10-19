import { CatsRepository } from './cats.repository';
import { Cat } from './cats.schema';
import { CatRequestDto } from './dto/cats.request.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ReadonlyCatDto } from './dto/cat.dto';

@Injectable()
export class CatsService {
  constructor(private readonly catsRepository: CatsRepository) {}

  async signUp(dto: CatRequestDto): Promise<ReadonlyCatDto> {
    const { email, password, name } = dto;

    // 이메일 중복 검사
    const isCatExist = await this.catsRepository.existsByEmail(email);
    if (isCatExist) {
      throw new ConflictException('이미 사용중인 이메일입니다.');
    }

    // 패스워드 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.catsRepository.createUser({
      name,
      password: hashedPassword,
      email,
    });
  }
}
