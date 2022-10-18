import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CatRequestDto {
  @ApiProperty({
    example: 'example1@example.com',
    description: 'email',
    required: true,
    uniqueItems: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '12323sdhuinm!@#',
    description: 'password',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'coco',
    description: 'cat name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
