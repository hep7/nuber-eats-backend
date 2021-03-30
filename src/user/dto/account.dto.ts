
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Response } from 'src/common/dto/response.dtos';
import { NuberUser } from '../entity/user.entity';

@InputType()
export class CreateAccountReq extends PickType(NuberUser,['email','password','role']){}

@ObjectType()
export class CreateAccountRes extends Response {
    
}

@InputType()
export class LoginReq extends PickType(NuberUser, ['email', 'password']) {}

@ObjectType()
export class LoginRes extends Response {
  @Field(type => String,{nullable:true})
  token?: string;  
}
