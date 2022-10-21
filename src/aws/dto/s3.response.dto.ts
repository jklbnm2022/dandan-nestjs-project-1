import { AWSError } from 'aws-sdk';
import { PutObjectOutput } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';

export class S3ResDto {
  key: string;
  s3Object: PromiseResult<PutObjectOutput, AWSError>;
  contentType: string;
}
