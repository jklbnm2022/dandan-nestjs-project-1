import { LoginRequestDto } from './dto/login.request.dto';
import { CatsRepository } from './../cats/cats.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly catsRepository: CatsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async jwtLogIn(data: LoginRequestDto) {
    const { email, password } = data;
    // 가입여부 확인
    const cat = await this.catsRepository.findCatByEmail(email);
    if (!cat) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해 주세요.');
    }

    // password 확인 - 유효성검사
    const isPasswordValidated: boolean = await bcrypt.compare(
      password,
      cat.password,
    );

    if (!isPasswordValidated) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해 주세요.');
    }

    const payload = { email, sub: cat.id };

    return {
      token: this.jwtService.sign(payload),
    };
  }
}
