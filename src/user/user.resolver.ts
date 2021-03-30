import { UseGuards } from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth.user.decorator';
import { CreateAccountReq, CreateAccountRes, LoginReq, LoginRes } from './dto/account.dto';
import { UpdateUserProfileReq, UpdateUserProfileRes, UserProfileReq, UserProfileRes, VerifyEmailReq, VerifyEmailRes } from './dto/profile.dto';
import { NuberUser } from './entity/user.entity';
import { UserService } from './user.service';

const success:string = "success";

@Resolver(of => NuberUser)
export class UserResolver {
    constructor(
        private readonly userService:UserService
    ){}

 
    @Mutation(returns=>CreateAccountRes)
    async createAccount(@Args('input') createAccountReq:CreateAccountReq):Promise<CreateAccountRes>{
        return  await this.userService.createAccount(createAccountReq);                    
    }

    @Mutation(returns=>LoginRes)
    async login(@Args('input') loginReq:LoginReq):Promise<LoginRes>{        
        return await this.userService.login(loginReq);
    }

    @Query(returns => NuberUser)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser:NuberUser):NuberUser{
        return authUser;
    }

    @UseGuards(AuthGuard)
    @Query(returns => UserProfileRes)
    async userProfile(@Args() userProfileReq:UserProfileReq):Promise<UserProfileRes>{
        return  await this.userService.findById(userProfileReq.userId);        
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => UpdateUserProfileRes)
    async updateUserProfile(
        @AuthUser() user:NuberUser,
        @Args("input") updateUerProfileReq:UpdateUserProfileReq):Promise<UpdateUserProfileRes>{       
            return await this.userService.updateUserProfile(user.id,updateUerProfileReq);            
        }
        

    @Mutation(returns => VerifyEmailRes)
    async verifyEmail(        
        @Args("input") verifyEmailReq:VerifyEmailReq):Promise<VerifyEmailRes>{
            return this.userService.verifyEmail(verifyEmailReq.code);                
        }
}