import { Inject, Injectable } from '@nestjs/common';
import { EmailArg, EmailModuleOption } from './email.interface';
import got from 'got';
import { EMAIL_CONFIG_OPTION } from './email.constraint';
import * as FormData from 'form-data';
import * as is from 'src/common/common.result-const';
import { SimpleConsoleLogger } from 'typeorm';




@Injectable()
export class EmailService {
  constructor(@Inject(EMAIL_CONFIG_OPTION) private readonly options:EmailModuleOption){
  }

  public async sendVerificationMail(to:string,code:string):Promise<{result:string}>{
    await this.sendMail(to,"confirm-email",[{key:"code",value:code}]);
    return {result:is.ok}
  }

  public  async  sendMail(to:string,template:string,eArg:EmailArg[]):Promise<{result:string}>{
    const form = new FormData();    
    form.append('from',`Excited User <${this.options.sender}>`);
    form.append('to',to);
    form.append('template',template);
    eArg.forEach((arg:EmailArg)=>{
      form.append(`v:${arg.key}`,arg.value);
    })    
    
     await got.post(this.options.url,
      {        
        headers:{
          Authorization:`Basic ${Buffer.from(
            `api:${this.options.apiKey}`).toString('base64')}`
        },
        body:form,
      });

      return {result:is.ok}

  }
}
