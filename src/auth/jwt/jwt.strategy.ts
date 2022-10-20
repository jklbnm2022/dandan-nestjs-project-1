import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Payload } from './jwt.payload';
import { CatsRepository } from 'src/cats/cats.repository';
import mongoose from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly catsRepository: CatsRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: Payload) {
    const sub = new mongoose.Types.ObjectId(payload.sub);
    const cat = await this.catsRepository.findCatByIdWithoutPassword(sub);

    if (!cat) {
      throw new UnauthorizedException(
        '만료되었거나 사용할 수 없는 인증입니다.',
      );
    }

    return cat;
  }
}
