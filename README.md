# 탄탄한 백엔드 NestJS, 기초부터 심화까지

- 해당 레포지토리는 인프런의 NestJS 강의 [탄탄한 백엔드 NestJS, 기초부터 심화까지](https://www.inflearn.com/course/%ED%83%84%ED%83%84%ED%95%9C-%EB%B0%B1%EC%97%94%EB%93%9C-%EB%84%A4%EC%8A%A4%ED%8A%B8/dashboard) 의 내용을 클론코딩 및 수정한 레포지토리입니다.
- 코드 작성 범위 : 섹션 3 ~ 섹션 5. 프로젝트 배포와 서버 운영(AWS-SDK를 사용하여 S3에 업로드) 까지

## 개발환경
저는 현재 실무에서 NestJS와 Typeorm 의 최신버전을 활용하여 백엔드 코드를 작성하고 있습니다. 그렇기에 이 레포지토리의 코드 또한 강의 촬영 당시가 아닌 현재(2022.10.21.) 시점 최신 버전을 활용하여 코드를 작성하였습니다.
- NestJS v9
- Mongoose v6
- AWS-SDK v2

## 강의와 다른 주요 코드

### auth

`src/auth/auth.module.ts`

```ts
// jwtModule 을 register 가 아닌 registerAsync 로 등록합니다.
JwtModule.registerAsync({
  inject: [ConfigService],
  // useFactory 를 활용하여 env 내용이 누락(undefined)되지 않도록 합니다.
  useFactory: (config: ConfigService) => {
    return {
      secret: config.get<string>('JWT_SECRET_KEY'),
      signOptions: { expiresIn: '1y' },
    };
  },
}),
```

`src/auth/jwt/jwt.payload.ts`

```ts
async validate(payload: Payload) {
  /*
  sub를 string 으로 받더라도 타입을 ObjectId로 치환합니다.
  백엔드 코드 내에서는 모든 id가 ObjectId type으로 치환되도록 하였습니다.
  src/common/pipes/parseStringToObjectId.pipe.ts 에서 관련 내용 확인 가능합니다.
  */
  const sub = new mongoose.Types.ObjectId(payload.sub);
  const cat = await this.catsRepository.findCatByIdWithoutPassword(sub);

  if (!cat) {
    throw new UnauthorizedException(
      '만료되었거나 사용할 수 없는 인증입니다.',
    );
  }

  return cat;
}
```

### aws

`src/aws/dto/s3.response.dto.ts`

```ts
import { AWSError } from 'aws-sdk';
import { PutObjectOutput } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';

// aws.service.ts 의 uploadFileToS3 함수의 리턴값 타입을 분리했습니다.
export class S3ResDto {
  key: string;
  s3Object: PromiseResult<PutObjectOutput, AWSError>;
  contentType: string;
}
```

`src/aws/aws.service.ts`

```ts
@Injectable()
export class AwsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(private readonly configService: ConfigService) {
    // aws-sdk v2 에 맞게 S3 생성 및 등록 방법을 수정했습니다.
    this.awsS3 = new AWS.S3();
    this.awsS3.config.update({
      credentials: {
        accessKeyId: this.configService.get('PUBLIC_KEY'),
        secretAccessKey: this.configService.get('SECRET_KEY'),
      },
    });
    this.S3_BUCKET_NAME = this.configService.get('BUCKET_NAME');
  }
}
```

### cats

`src/cats/cat.schema.ts`

```ts
export class Cat extends Document {
  /*
  생략
  */

  /*
  imgUrl과 imgKey 를 분리해서 저장합니다. 물론 imgUrl을 파싱해서 Key를 추출할 수도 있습니다. 하지만 별도의 파싱 과정 없이 imgKey를 이용하기 위해 분리합니다.
  */
  @Prop({
    required: false,
    default: '',
  })
  imgKey: string;

  @Prop({
    require: false,
    default: '',
  })
  imgUrl: string;

  /*
  ReadOnlyDataType 을 지정하여 readOnlyData 를 사용하는 곳에서 type을 두 번 작성하는 일이 없게 했습니다.
  */
  readonly readOnlyData: ReadOnlyDataType;
}

type ReadOnlyDataType = {
  id: Types.ObjectId;
  email: string;
  name: string;
  imgUrl: string;
  Comments: Comments[];
};
```

`src/cats/cats.module.ts`

```ts
MulterModule.register({
  // destination
  dest: './upload',
  storage: multer.memoryStorage()
}),
```

- buffer 문제 해결은 강의 질문 게시판에서 홍승빈 님이 작성하신 [글](https://inflearn.com/questions/653198)을 참고했습니다.

`src/cats/cats.repository.ts`

```ts
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

  // id 의 타입이 string 이 아니라 ObjectId 입니다.
  async findCatByIdWithoutPassword(id: Types.ObjectId): Promise<Cat | null> {
    const cat = await this.catModel.findById(id).select('-password');
    return cat;
  }

  // 업로드 후 관련 데이터를 DB 에 적용합니다.
  async findByIdAndUpdateImg(
    id: string,
    imgKey: string,
    imgUrl: string,
  ): Promise<ReadOnlyCatDto> {
    const cat = await this.catModel.findById(id);
    cat.imgKey = imgKey;
    cat.imgUrl = imgUrl;
    const newCat = await cat.save();
    return newCat.readOnlyData;
  }

  // mongoose 6 부터로 추정됩니다만. populate에 2번째에 Model 을 넣으면 이미 계산했다는 에러가 납니다. 아래와 같이 빼주면 됩니다.
  async findAll() {
    return await this.catModel.find({}).populate('comments');
  }

  async deleteUserImg(cat: Cat) {
    cat.imgKey = '';
    cat.imgUrl = '';
    const newCat = await cat.save();
    return newCat.readOnlyData;
  }
}
```

`src/cats/services/cats.service.ts`

```ts
/*
컨트롤러가 변경된 것과 같은 이유로, 따로 body를 받지 않고 cat.id 를 통해 목표로 하는 user id 를 찾아 적용합니다.
*/
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

/*
고양이의 profile image 를 삭제하는 service function 이기 때문에 cat을 받아 내부 데이터로 삭제를 진행합니다.
*/
async deleteImg(cat: Cat) {
  const response = await this.awsService.deleteS3Object(cat.imgKey);
  if (response.success) {
    return await this.catsRepository.deleteUserImg(cat);
  }
}
```

`src/cats/controllers/cats.controller.ts`

```ts
/*
  고양이 이미지 업로드 및 제거 과정에서 id 를 받지 않습니다. 고양이 이미지를 profile 로 가정할 때,
  고양이는 '자신의' 이미지만 추가 혹은 제거할 수 있어야 하기 때문입니다.
  만약 인스타그램처럼 게시글 내 이미지를 추가 또는 삭제해야 한다면, 수정할 게시글 id 와 삭제할 이미지 혹은 이미지의 key 값을 받으면 됩니다.
*/

@UseInterceptors(FilesInterceptor('image', 10))
@UseGuards(JwtAuthGuard)
@Post('profile')
uploadCatImg(
  @UploadedFiles() files: Array<Express.Multer.File>,
  @CurrentUser() cat: Cat,
) {
  return this.catsService.uploadImg(cat, files);
}

@UseGuards(JwtAuthGuard)
@Delete('profile')
deleteCatImg(@CurrentUser() cat: Cat) {
  return this.catsService.deleteImg(cat);
}
```

### comments

- 강의에서는 `comments.service.ts`에 쿼리 내용도 넣었지만, 저는 repository 와 service 를 분리했습니다.
- 강의에서 author 를 외부에서 string 으로 받지만, 저는 `@CurrentUser` 데코레이터를 이용해 user를 조회한 후, user.\_id 를 통해 author 를 입력했습니다. 그래서 `comments.create.dto.ts`, `repository`, `service`, `controller` 의 내용이 강의와 다릅니다.

### common

`src/common/pipes/parseStringToObjectId.pipe.ts`

```ts
/*
몽구스의 Types 을 활용해 id 의 타입을 ObjectId 로 변경했습니다.
이를 통해 컨트롤러 및 기타 함수에서 id 의 타입을 ObjectId 로 통일할 수 있습니다.
*/

import { Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    return new Types.ObjectId(value);
  }
}
```

### app
`src/app.module.ts`
```ts
@Module(
  {
    imports: [
      // isGlobal: true 를 해줘야 모든 곳에서 ConfigModule 을 사용하여 env 를 불러올 수 있습니다.
      ConfigModule.forRoot({ isGlobal: true }),
      MongooseModule.forRoot(
        // url을 MONGODB_URI 로 바로 넣지 않았습니다. username, password, database 을 분리했습니다.
        `${process.env.MONGO_URL_PREFIX}${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}${process.env.MONGO_URL_SUFFIX}${process.env.MONGO_DATABASE}`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      ),
    ]
  }
)
```

`src/main.ts`
```ts
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  /* 생략 */
  // swagger
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    // 스웨거에서 header에 authorization 설정을 해주기 위해서는 아래 메소드를 실행해야 합니다.
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'Token' })
    .build();
}

```

## aws s3 설정 방법
`버킷 정책`
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::[bucket-name]/*"
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::[계정ID]:user/[권한을 줄 IAM 사용자명]"
            },
            "Action": [
                "s3:DeleteObject",
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::[bucket-name]/*"
        }
    ]
}
```
- 버킷 정책은 한승욱 님의 [AWS 버킷 권한과의 씨름...](https://wooogy-egg.tistory.com/77) 을 참고했습니다.