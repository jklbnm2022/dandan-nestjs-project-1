import { CatsRepository } from '../cats.repository';
import { Cat } from '../cats.schema';
import { CatRequestDto } from '../dto/cats.request.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ReadOnlyCatDto } from '../dto/cat.dto';
import { AwsService } from 'src/aws/aws.service';
import { S3ResDto } from 'src/aws/dto/s3.response.dto';

@Injectable()
export class CatsService {
  constructor(
    private readonly catsRepository: CatsRepository,
    private readonly awsService: AwsService,
  ) {}

  async signUp(dto: CatRequestDto): Promise<ReadOnlyCatDto> {
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

  async getAllCat() {
    const allCat = await this.catsRepository.findAll();
    const readOnlyCats = allCat.map((cat) => cat.readOnlyData);
    return readOnlyCats;
  }

  async uploadImg(cat: Cat, files: Array<Express.Multer.File>) {
    const response: S3ResDto = await this.awsService.uploadFileToS3(
      'cats',
      files[0],
    );

    const imgUrl = this.awsService.getAwsS3FileUrl(response.key);

    const newCat = await this.catsRepository.findByIdAndUpdateImg(
      cat.id,
      response.key,
      imgUrl,
    );
    return newCat;
  }

  async deleteImg(cat: Cat) {
    const response = await this.awsService.deleteS3Object(cat.imgKey);
    if (response.success) {
      return await this.catsRepository.deleteUserImg(cat);
    }
  }
}
