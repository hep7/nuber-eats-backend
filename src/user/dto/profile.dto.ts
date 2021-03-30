import { ArgsType, Field, InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { Response } from 'src/common/dto/response.dtos';
import { NuberUser } from '../entity/user.entity';

@ArgsType()
export class UserProfileReq{
    @Field( type=>Number)
    userId:number;    
}

@ObjectType()
export class UserProfileRes extends Response{
  @Field(type=>NuberUser,{nullable:true})
  user?:NuberUser;  
}


@InputType()
export class UpdateUserProfileReq extends PartialType(PickType(NuberUser,['email','password'])) {
   
}

@ObjectType()
export class UpdateUserProfileRes extends Response {

}

@InputType()
export class VerifyEmailReq {
  @Field(type=>String)
  code:string
}

@ObjectType()
export class VerifyEmailRes extends Response {
  
}