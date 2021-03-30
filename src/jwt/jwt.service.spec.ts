import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { JWT_CONFIG_OPTIONS } from 'src/jwt/jwt.constants';
import { JwtService } from './jwt.service';


const testPrivateKey = "test-privatekey";
const USER_ID =1;

jest.mock('jsonwebtoken',()=>{
  return{
    sign:jest.fn(()=>{
      return "TOKEN";
    }),
    verify:jest.fn(()=>{
      return {id:USER_ID}
    }),  
  }
});

describe("jwtService",()=>{
  let jwtService:JwtService;

  beforeEach(async () =>{
    const module = await Test.createTestingModule({
      providers:[
        JwtService,
        {
          provide:JWT_CONFIG_OPTIONS,
          useValue:{privateKey:testPrivateKey}
        },
      ],
    }).compile();
    jwtService = module.get<JwtService>(JwtService);    
  })

  it('should be defined',()=>{
    expect(jwtService).toBeDefined();
  })

  describe('sign', ()=>{
    const userId = 1;
    it('it should return signed token',()=>{
      const token = jwtService.sign(USER_ID);
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({id:USER_ID},testPrivateKey);      
    })
  })

  describe('vefify',()=>{
    it('should return the decoded totken',()=>{
      const TOKEN = "token";
      const verifiedToken = jwtService.verify(TOKEN);
      expect(verifiedToken).toEqual({id:USER_ID});
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN,testPrivateKey)
    })
  })

})