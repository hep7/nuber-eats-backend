import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { NuberUser } from './entity/user.entity';
import { Verification } from './entity/verification.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
    imports:[TypeOrmModule.forFeature([NuberUser,Verification])],
    providers:[UserResolver,UserService],
    exports:[UserService]
})
export class UserModule {}
