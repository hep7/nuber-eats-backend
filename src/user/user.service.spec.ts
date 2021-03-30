import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as is from 'src/common/common.result-const';
import { EmailService } from 'src/email/email.service';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { NuberUser, UserRole } from './entity/user.entity';
import { Verification } from './entity/verification.entity';
import { UserService } from './user.service';

const mockRepository = ()=>({
  findOne:jest.fn(),
  save:jest.fn(),
  create:jest.fn(),
  findOneOrFail:jest.fn(),
  delete:jest.fn()
})


const mockEmailService = ()=>({
  sendVerificationMail:jest.fn(),
})

const mockJwtService = ()=>({
  verify:jest.fn(),
  sign:jest.fn(()=>'valid-token'),
})

type MockRepository<T=any> = Partial<Record<keyof Repository<T>,jest.Mock>>;


describe('UserService',()=>{
  let userService:UserService;
  let emailService:EmailService;
  let jwtService:JwtService;
  let userRepository:MockRepository<NuberUser>;
  let verifyRepository:MockRepository<Verification>
  
  beforeEach(async ()=>{
    const module = await Test.createTestingModule({
      providers:[
        UserService,
        {
          provide:getRepositoryToken(NuberUser),
          useValue:mockRepository(),
        },
        {
          provide:getRepositoryToken(Verification),
          useValue:mockRepository(),
        }
        ,
        {
          provide:EmailService,
          useValue:mockEmailService(),
        }
        ,
        {
          provide:JwtService,
          useValue:mockJwtService(),
        }

      ]
    }).compile();    
    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(NuberUser));
    verifyRepository = module.get(getRepositoryToken(Verification));

  })  

  it('should be defined',()=>{
    expect(userService).toBeDefined();
    expect(emailService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(verifyRepository).toBeDefined();
  });



  describe('createAccount',()=>{
    const createAccountArg = {
      email:"hep7@naver.com",
      password:"1234",
      role:UserRole.Client
    }

    it('should fail if user exist',async ()=>{
      userRepository.findOne.mockResolvedValue({
        id:1,
        email:""
      });
      const result  = await userService.createAccount(createAccountArg);
      expect(result).toMatchObject({result:is.userAlreadyExist});
    });

    it('should create a new user',async ()=>{
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArg)
      userRepository.save.mockResolvedValue(createAccountArg);
      verifyRepository.create.mockReturnValue({user:createAccountArg});
      verifyRepository.save.mockResolvedValue({code:'code'});

      const result = await userService.createAccount(createAccountArg);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArg);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArg);

      expect(verifyRepository.create).toHaveBeenCalledTimes(1);
      expect(verifyRepository.create).toHaveBeenCalledWith({user:createAccountArg});
      expect(verifyRepository.save).toHaveBeenCalledTimes(1);
      expect(verifyRepository.save).toHaveBeenCalledWith({user:createAccountArg});

      expect(emailService.sendVerificationMail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationMail).toHaveBeenCalledWith(createAccountArg.email,'code');

      expect(result).toMatchObject({result:is.ok});      
    })

    it('should fail on exception',async()=>{
      userRepository.findOne.mockRejectedValue(new Error()); 
      await expect(userService.createAccount(createAccountArg)).rejects.toMatchObject(new Error());
    }
    )
  });

  describe('login',()=>{
    const loginArg = {
      email:"hep7@naver.com",
      password:"12345"
    }
    it('should fail if user does not exist',async ()=>{
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await userService.login(loginArg);
      expect(result).toMatchObject({result:is.userNotFound});
    })

    it('should fail if password is invalid',async ()=>{
      const mockUser = {
        id:1,
        checkPassword:jest.fn(()=>Promise.resolve(false)),
      }
      userRepository.findOne.mockResolvedValue(mockUser);
      const result  =await userService.login(loginArg);
      expect(result).toMatchObject({result:is.invalidPassword});
    })

    it('should get token',async ()=>{
      const mockUser = {
        id:1,
        checkPassword:jest.fn(()=>Promise.resolve(true)),
      }
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.login(loginArg);
      expect(result).toMatchObject({result:is.ok,token:"valid-token"});
    })

    it('should fail on exception',async ()=>{
      userRepository.findOne.mockRejectedValue(new Error());
      await expect(userService.login(loginArg)).rejects.toEqual(new Error());
    })

  });

  describe('findById',()=>{

    const findIdArg = 
    it("should fail if user not found",async ()=>{
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await userService.findById(1);
      expect(result).toMatchObject({result:is.userNotFound});
    })

    it('should fail on exception',async ()=>{
      userRepository.findOne.mockRejectedValue(new Error('error'));
      expect(userService.findById(1)).rejects.toEqual(new Error('error'));
    })

    it('should find user',async()=>{
      const user = {
        email:"hep7@naver.com",
        password:"1234",
        role:UserRole.Client      
      }      
      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.findById(1);

      expect(result).toMatchObject({
        result:is.ok,
        user
      })
    })
  });  

  describe('updateUserProfile',()=>{
    const mockUser = {
      id:1,
      email:"hep7@naver.com",
      verified:true,
    };


    const mockNewUser = {
      id:1,
      email:"hep6@naver.com",
      verified:false,
    };

    const updateUserArg = {
      id:1,
      updateUserProfileReq:{
        email:"hep6@naver.com",    
      }
    }

    const mockVerification = {
      code:'code',
    }

    it('should fail if no user found',async () =>{
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await userService.updateUserProfile(updateUserArg.id,updateUserArg.updateUserProfileReq);
      expect(result).toMatchObject({result:is.userNotFound});
    })

    it('should change email',async () =>{
      userRepository.findOne.mockResolvedValue(mockUser);
      verifyRepository.create.mockReturnValue(mockVerification);
      verifyRepository.save.mockResolvedValue(mockVerification);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockNewUser);

      const result = await userService.updateUserProfile(updateUserArg.id,updateUserArg.updateUserProfileReq);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({id:updateUserArg.id});

      expect(verifyRepository.save).toHaveBeenCalledWith(mockVerification);   

      expect(emailService.sendVerificationMail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationMail).toHaveBeenCalledWith(
        mockNewUser.email,
        mockVerification.code
      );

      expect(userRepository.create).toHaveBeenCalledWith({...mockNewUser});
      expect(result).toMatchObject({result:is.ok});

    })
  })

  describe('verifyEmail', ()=>{
    
    const verifyEmailArg = {
      code:"code",     
    }
    const mockUser = {
      id:1
    }
    const mockVerification = {
      code:'valid', 
      user:mockUser
    };
    
    it('should vefiy email',async ()=>{
      verifyRepository.findOne.mockResolvedValue(mockVerification);
      const result = await userService.verifyEmail(verifyEmailArg.code) ;
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(verifyRepository.delete).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({result:is.ok});      

    })

    it('should fail if verification is not found',async ()=>{
      verifyRepository.findOne.mockResolvedValue(undefined);
      const result = await userService.verifyEmail(verifyEmailArg.code) ;
      expect(result).toMatchObject({result:is.invalidCode});            
    })

    it('should fail on exception',()=>{
      verifyRepository.findOne.mockRejectedValue(new Error('error'));
      expect(userService.verifyEmail(verifyEmailArg.code)).rejects.toEqual(new Error('error'))
    })
  })

})
