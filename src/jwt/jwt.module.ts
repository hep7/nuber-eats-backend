import { DynamicModule, Global, Module } from '@nestjs/common';
import { JWT_CONFIG_OPTIONS } from './jwt.constants';
import { JwtMoudlOptions } from './jwt.interface';
import { JwtService } from './jwt.service';


@Module({})
@Global()
export class JwtModule {
  static forRoot(options:JwtMoudlOptions):DynamicModule {
    return {
      module:JwtModule,
      exports:[JwtService],
      providers:[
        {
          provide:JWT_CONFIG_OPTIONS,
          useValue:options
        },
        JwtService
      ],

    }
  }
}
