import { ApiProperty, PickType } from '@nestjs/swagger';
import { Cat } from '../cats.schema';

// response dto
export class ReadonlyCatDto extends PickType(Cat, ['email', 'name', 'imgUrl'] as const) {
  @ApiProperty({
    example: '3280199',
    description: 'mongoDB id',
  })
  id: string;
}
