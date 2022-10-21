import { ApiProperty, PickType } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Cat } from '../cats.schema';

// response dto
export class ReadOnlyCatDto extends PickType(Cat, ['email', 'name', 'imgUrl'] as const) {
  @ApiProperty({
    example: '3280199',
    description: 'mongoDB id',
  })
  id: Types.ObjectId;
}
