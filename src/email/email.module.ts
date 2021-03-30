import { DynamicModule, Global, Module } from '@nestjs/common';
import { EMAIL_CONFIG_OPTION } from './email.constraint';
import {EmailModuleOption} from './email.interface'
import { EmailService } from './email.service';

@Global()
@Module({})
export class EmailModule {
  static forRoot(options:EmailModuleOption):DynamicModule {
    return {
      module:EmailModule,
      exports:[EmailService],
      providers:[
        {
          provide:EMAIL_CONFIG_OPTION,
          useValue:options
        },        
        EmailService,        
      ],

    }
  }
}
