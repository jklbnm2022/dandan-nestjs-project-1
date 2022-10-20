import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Cat extends Document {
  @ApiProperty({
    example: 'example1@example.com',
    description: 'email',
    required: true,
    uniqueItems: true,
  })
  @Prop({
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'coco',
    description: 'cat name',
    required: true,
  })
  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '12323sdhuinm!@#',
    description: 'password',
    required: true,
  })
  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Prop({
    required: false,
    default: '',
  })
  imgUrl: string;

  readonly readOnlyData: readOnlyDataType;
}

export const CatSchema = SchemaFactory.createForClass(Cat);

type readOnlyDataType = {
  id: Types.ObjectId;
  email: string;
  name: string;
  imgUrl: string;
};

// 가상의 필드
CatSchema.virtual('readOnlyData').get(function (this: Cat): readOnlyDataType {
  return {
    id: this.id,
    email: this.email,
    name: this.name,
    imgUrl: this.imgUrl,
  };
});
