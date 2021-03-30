import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { NuberUser } from 'src/user/entity/user.entity';
import { Verification } from 'src/user/entity/verification.entity';
import { getConnection, Repository } from 'typeorm';
import * as is from 'src/common/common.result-const';

jest.mock('got');

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'test@test.com',
  password: '12345',
};

describe('UserModule (e2e)',()=>{
  let app:INestApplication;
  let userRepository:Repository<NuberUser>;
  let verificationRepository:Repository<Verification>;
  let jwtToken:string;

  const baseRequest = ()=>request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicRequest = (query:string)=> baseRequest().send({query});
  const privateRequest = (query:string)=> baseRequest().set('X-JWT',jwtToken).send({query});

  beforeAll(async()=>{
    const module:TestingModule = await Test.createTestingModule({
      imports:[AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<NuberUser>>(getRepositoryToken(NuberUser));
    verificationRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));
    await app.init();
  })

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();    
  })

  it('should be defined',()=>{
    expect(app).toBeDefined();
  })

  describe('create Account',()=>{
    it('should create account',()=>{
      return publicRequest(`
        mutation{
          createAccount(input:{
            email:"${testUser.email}"
            password:"${testUser.password}"
            role:Client
          }){
            result
            }
        }
      `)
      .expect(200)
      .expect(res=>{
        console.log(res.body);
        const {body:{data:{createAccount:result}}} = res;
        expect(result).toEqual({result:is.ok});
      })      
    })

    it('should fail if account already exist',()=>{
        return publicRequest(`
        mutation{
          createAccount(input:{
            email:"${testUser.email}"
            password:"${testUser.password}"
            role:Client
          }){
            result
            }
        }
      `)
      .expect(200)
      .expect(res=>{
        const {body:{data:{createAccount:result}}} = res;
        expect(result).toEqual({result:is.userAlreadyExist});
      })            
    })
  })

  describe('login',()=>{
    it('should login with correct credentials',()=>{
      return publicRequest(`
        mutation{
          login(input:{
            email:"${testUser.email}"
            password:"${testUser.password}"
          }){
            result
            token
          }
        }      
      `)
      .expect(200)
      .expect(res=>{
        const {body:{data:{login}}} = res;        
        expect(login.result).toBe(is.ok);
        expect(login.token).toEqual(expect.any(String));
        jwtToken = login.token;
      })
    })
    it('should login fail with invalid credentials',()=>{
      return publicRequest(`
        mutation{
          login(input:{
            email:"${testUser.email}"
            password:"xxx"
          }){
            result
            token
          }
        }      
      `)
      .expect(200)
      .expect(res=>{
        const {body:{data:{login}}} = res;        
        expect(login).toEqual({result:is.invalidPassword,token:null});
        
      })
    })
  })

  describe('userProfile',()=>{
    let userId:number;
    beforeAll(async()=>{
      const [user] = await userRepository.find();
      userId = user.id;
    })

    it("should see a user's profile",()=>{
      return privateRequest(`
        query{
          userProfile(userId:${userId}){
            result
            user{
              id     
            }
          }
        }      
      `).expect(200).expect(res=>{
        const {body:{data:{userProfile}}} = res;
        expect(userProfile).toEqual({result:is.ok,user:{id:userId}});
      })     
    })

    it("should not find user's profile",()=>{
      return privateRequest(`
        query{
          userProfile(userId:${9999}){
            result
            user{
              id     
            }
          }
        }      
      `).expect(200).expect(res=>{
        const {body:{data:{userProfile}}} = res;
        expect(userProfile).toEqual({result:is.userNotFound,user:null});
      })     
    })
  })

  describe("me",()=>{
    it("should find my profile",()=>{
      return privateRequest(`
        query{
          me{
            email
          }
        }
      `).expect(200).expect((res)=>{
        const {body:{data}} = res;
        expect(data).toEqual({
          me:{email:testUser.email}
        })
      })
    })
    it("should not allowd logout user",()=>{
      return publicRequest(`
        query{
          me{
            email
            verified    
          }
        }
      `).expect(200).expect((res)=>{        
        const {body:{errors}} = res;
        const [error] = errors;
        expect(error.message).toBe('Forbidden resource');        
      })
    })
  })

  describe('updateProfile',()=>{
    const NEW_MAIL = 'new@new.com';
    it('should change email',()=>{
      return privateRequest(`
        mutation{
          updateUserProfile(input:{    
            email:"${NEW_MAIL}"          
          }){
            result
          }
        }
      `).expect(200).expect((res)=>{
        const {body:{data:{updateUserProfile}}} = res;
        expect(updateUserProfile).toEqual({result:is.ok});
      });
    })
    it('should have new eamil',()=>{
      return privateRequest(`
        query{
          me{
            email    
          }
        }
      `).expect(200).expect((res)=>{
        const {body:{data:{me}}} = res;
        expect(me).toEqual({email:NEW_MAIL});
      });
    })
  })

  describe('verifyEmail',()=>{
    let verificationCode:string;
    beforeAll(async ()=>{
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });

    it('should verify email',()=>{
      return publicRequest(`
        mutation{
          verifyEmail(input:{
            code:"${verificationCode}"
          }){
            result
          }
        }
      `).expect(200).expect((res)=>{
        const {body:{data:{verifyEmail}}} = res;
        expect(verifyEmail).toEqual({result:is.ok});
      })
    })
    it("should email verified",()=>{
      return privateRequest(`
        query{
          me{
            verified
          }
        }
      `).expect(200).expect((res)=>{
        const {body:{data}} = res;
        expect(data).toEqual({
          me:{verified:true}
        })
      })
      it('should fail verify email by invalid code',()=>{
        return publicRequest(`
          mutation{
            verifyEmail(input:{
              code:"${verificationCode}"
            }){
              result
            }
          }
        `).expect(200).expect((res)=>{
          const {body:{data:{verifyEmail}}} = res;
          expect(verifyEmail).toEqual({result:is.invalidCode});
        })
      })
    })

  })


})