import { InternalServerErrorException } from '@nestjs/common';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from 'src/common/entity/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';


// type UserRole = 'client' | 'owner' | 'delevery';
export enum UserRole {
    Client,
    Owner,
    Delivery,
}

registerEnumType(UserRole,{name:'UserRole'});


@InputType({isAbstract:true})
@ObjectType()
@Entity()
export class NuberUser extends CoreEntity {
    @Column({unique:true})    
    @Field(type=>String)
    email:string;

    @Column({select:false})
    @Field(type=>String)
    password:string;

    @Column({type:'enum',enum:UserRole })
    @Field(type=>UserRole)
    role:UserRole;

    @Column({default:false})
    @Field(type=>Boolean)
    verified:boolean;
    
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword():Promise<void>{
        try{
            if(this.password){
                this.password = await bcrypt.hash(this.password,10);
            }
            
        }catch(e){
            console.log(e);
            throw new InternalServerErrorException();
        }
    }

    async checkPassword(password:string):Promise<boolean>{
        try{
            const ok = await bcrypt.compare(password,this.password);
            return ok;
        }catch(e){
            console.log(e);
            throw new InternalServerErrorException();
        }
    }

}