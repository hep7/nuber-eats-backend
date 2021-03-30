import { Test } from '@nestjs/testing';
import { EMAIL_CONFIG_OPTION } from './email.constraint';
import { EmailService } from './email.service';
import * as is from 'src/common/common.result-const';
import got from 'got';
import * as FormData from 'form-data';

jest.mock('got');
jest.mock('form-data')

describe("emailService",()=>{
  let emailService:EmailService;
  const TEST_URL = "test-url";
  beforeEach(async ()=>{
    const module = await Test.createTestingModule({
      providers:[
        EmailService,
        {
          provide:EMAIL_CONFIG_OPTION,
          useValue:{url:TEST_URL,apkey:"test-apikey",sender:"test@test.com"}
        }
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  })

  it('should be defined',()=>{
    expect(emailService).toBeDefined();
  })

  describe('sendVerificationMail',()=>{
    it('should call sendEmail',()=>{
      const sendEmailArgs = {
        email:'email',
        code:'code',
      }

      jest.spyOn(emailService,'sendMail').mockImplementation(async ()=>({result:is.ok}));
      emailService.sendVerificationMail(sendEmailArgs.email,sendEmailArgs.code);
      expect(emailService.sendMail).toHaveBeenCalledTimes(1);
      expect(emailService.sendMail).toHaveBeenCalledWith(sendEmailArgs.email,"confirm-email",[{key:"code",value:sendEmailArgs.code}]);
    });
  })

  describe('sendEMail',()=>{
    it('send email',async ()=>{
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      const ok = await emailService.sendMail('','',[]);
      
      expect(formSpy).toHaveBeenCalled();
      expect(got).toHaveBeenCalledTimes(1);
      expect(got).toHaveBeenCalledWith(
        TEST_URL,
        expect.any(Object),
      );
      expect(ok).toEqual({result:is.ok});
    })

  })

})