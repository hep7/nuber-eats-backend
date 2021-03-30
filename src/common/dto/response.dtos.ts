import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Response {
    
    @Field(type=>String,{nullable:true})
    result?:string;
    
}