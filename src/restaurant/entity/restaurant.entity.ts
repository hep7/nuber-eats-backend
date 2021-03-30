import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {  IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity,  PrimaryGeneratedColumn } from 'typeorm';

@InputType({isAbstract:true})
@ObjectType()
@Entity()
export class Restaurant{

    @Field(type=>Number)
    @PrimaryGeneratedColumn()
    id:number;

    @Field(type=>String)
    @Column()
    @IsString()    
    @Length(5)
    name:String;

    @Field(type => Boolean,{defaultValue:true})
    @Column({default:true})
    @IsBoolean()
    @IsOptional()
    isVegan: boolean;
  
    @Field(type => String,{defaultValue:'강남'})
    @Column()
    @IsString()
    address: string;
  
    @Field(type => String)
    @Column()
    @IsString()
    ownersName: string;
  
    @Field(type=>String)
    @Column()
    @IsString()
    categoryName:String

}