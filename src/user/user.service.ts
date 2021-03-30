import { Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as is from 'src/common/common.result-const';
import { EmailService } from 'src/email/email.service';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateAccountReq, LoginReq } from './dto/account.dto';
import { UpdateUserProfileReq } from './dto/profile.dto';
import { NuberUser } from './entity/user.entity';
import { Verification } from './entity/verification.entity';

@Injectable()
//  @UseInterceptors(new ErrorsInterceptor())
export class UserService{
    
    constructor(
        @InjectRepository(NuberUser) private readonly users:Repository<NuberUser>,
        @InjectRepository(Verification) private readonly verification:Repository<Verification>,
        private readonly emailService:EmailService,
        private readonly jwtService:JwtService,
    ){
    }

    async findById(id: number):Promise<{result:string,user?:NuberUser}> {      
      const user = await this.users.findOne({id});
      if(user){
        return {result:is.ok,user}
      }else{
        return {result:is.userNotFound}
      }
    }

    async createAccount({email,password,role}:CreateAccountReq):Promise<{result:string}> {
       
        const exist = await this.users.findOne({email});
        if(exist){                
            return {result:is.userAlreadyExist};
        }

        let user = await this.users.save(this.users.create({email,password,role}));         
        const verification:Verification =  await this.verification.save(this.verification.create({user}));
        this.emailService.sendVerificationMail(email,verification.code);
      
        return {result:is.ok};        
    }

    
  
    async login({email,password}: LoginReq): Promise<{ result:string; token?: string }>{
      
        // make a JWT and give it to the user
        const user = await this.users.findOne({email},{select:['password','id']} );
        if (!user) {
          return {            
            result:is.userNotFound,
          };
        }

        const passwordCorrect = await user.checkPassword(password);
        if (!passwordCorrect) {
          return {            
            result:is.invalidPassword,
          };
        }

        const token = this.jwtService.sign(user.id);

        return {
          result:is.ok,
          token,
        };
    }

    async updateUserProfile(id:number,updateUerProfileReq: UpdateUserProfileReq):Promise<{result:string}> {
        const user =  await this.users.findOne({id}) 
          if(!user){
            return {result:is.userNotFound};
          }

          if(updateUerProfileReq.email){
            if(user.email !== updateUerProfileReq.email){            
              user.verified = false;        
              const exist = await this.users.findOne({email:updateUerProfileReq.email});
              if(exist){
                return {result:is.existEmail};
              }
              await this.verification.delete({user:{id:user.id}});

              const updatedUser = await this.users.save(this.users.create({...user,...updateUerProfileReq}));               
              const verification = await this.verification.save(this.verification.create({user:updatedUser}));   
              this.emailService.sendVerificationMail(updatedUser.email,verification.code)                                 ;
              return {result:is.ok}
            }
          } 

        await this.users.save(this.users.create({...user,...updateUerProfileReq}));               
        return {result:is.ok}
    }    

    async verifyEmail(code:string) :Promise<{result:string}>{ 
        const verification = await this.verification.findOne({code},{relations:['user']});

        if(!verification){
          return {result:is.invalidCode};                
        }

        const user = verification.user;
        user.verified = true;
        await this.users.save(user);
        await this.verification.delete({code})
        return {result:is.ok}
    }
}