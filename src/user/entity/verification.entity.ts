import { Field, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entity/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn,  OneToOne } from 'typeorm';
import { NuberUser } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@ObjectType()
@Entity()
export class Verification extends CoreEntity{

  @Field(type=>String)
  @Column({unique:true,nullable:false})  
  code : string;

  @OneToOne(type=>NuberUser,{onDelete:'CASCADE'})
  @JoinColumn()  
  user:NuberUser;

  @BeforeInsert()
  makeCode(){
    this.code = uuidv4();    
  }
}

