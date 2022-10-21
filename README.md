# 탄탄한 백엔드 NestJS, 기초부터 심화까지

- 해당 레포지토리는 인프런의 NestJS 강의 [탄탄한 백엔드 NestJS, 기초부터 심화까지](https://www.inflearn.com/course/%ED%83%84%ED%83%84%ED%95%9C-%EB%B0%B1%EC%97%94%EB%93%9C-%EB%84%A4%EC%8A%A4%ED%8A%B8/dashboard) 의 내용을 클론코딩 및 수정한 레포지토리입니다.
- 코드 작성 범위 : 섹션 3 ~ 섹션 5. 프로젝트 배포와 서버 운영(AWS-SDK를 사용하여 S3에 업로드) 까지

## 개발환경

강의 촬영 당시가 아닌 현재 시점 최신 버전을 활용하여 코드를 작성하였습니다. 최신 버전을 활용하여 강의를 듣다가 되지 않는 부분이 있을 때 레포지토리를 참고할 수 있도록 하기 위해서입니다.

- NestJS v9
- Mongoose v6
- AWS-SDK v2

## 강의와 다른 주요 코드

### auth

`src/auth/auth.module.ts`

```js
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

```js
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

```js
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

```js
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

```js
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
  readOnlyDataType 을 지정하여 readOnlyDataType 을 사용하는 곳에서 type을 두 번 작성하는 일이 없게 했습니다.
  */
  readonly readOnlyData: readOnlyDataType;
}

type readOnlyDataType = {
  id: Types.ObjectId;
  email: string;
  name: string;
  imgUrl: string;
  Comments: Comments[];
};
```

`src/cats/controllers/cats.controller.ts`

```js
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

`src/cats/services/cats.service.ts`

```js
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

`src/cats/cats.module.ts`
```js
MulterModule.register({
  // destination
  dest: './upload',
  storage: multer.memoryStorage()
}),
```
- 강의 질문 게시판의 [글](https://inflearn.com/questions/653198)을 참고했습니다. 작성자 홍승빈 님께 감사합니다.

`src/cats/cats.repository.ts`
```js

```

### comments

## aws s3 설정 방법

```json

```

```json

```
