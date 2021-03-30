import { Inject, Injectable } from '@nestjs/common';
import { JWT_CONFIG_OPTIONS } from './jwt.constants';
import * as jwt from 'jsonwebtoken';
import { JwtMoudlOptions } from './jwt.interface';

@Injectable()
export class JwtService {

  constructor(@Inject(JWT_CONFIG_OPTIONS) private readonly options:JwtMoudlOptions){

  }

  verify(token:string) {
    return jwt.verify(token,this.options.privateKey);
  }

  
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
}
