import { Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
    transform(value: string) {
        return new Types.ObjectId(value)
    }
}