import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { EmailModule } from './email/email.module';
import { jwtMiddleware } from './jwt/jwt.middleware';
import { JwtModule } from './jwt/jwt.module';
import { Restaurant } from './restaurant/entity/restaurant.entity';
import { RestaurantModule } from './restaurant/restaurant.module';
import { NuberUser } from './user/entity/user.entity';
import { Verification } from './user/entity/verification.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:process.env.NODE_ENV === "dev" ? ".dev.env" : '.test.env',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod','test')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY:Joi.string().required(),
        EMAIL_API_KEY:Joi.string().required(),
        EMAIL_URL:Joi.string().required(),
        EMAIL_SENDER:Joi.string().required(),        
      }),

    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context:({req})=>({user:req['user']})
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Restaurant,NuberUser,Verification],
      synchronize: process.env.NODE_ENV !== "prod" ? true : false,
      // logging: process.env.NODE_ENV === "dev" ? true : false,
      logging: false,
    }),    
    CommonModule,
    RestaurantModule,
    JwtModule.forRoot(
      {privateKey: process.env.PRIVATE_KEY}
    ),
    EmailModule.forRoot({
      apiKey:process.env.EMAIL_API_KEY,
      url:process.env.EMAIL_URL,
      sender:process.env.EMAIL_SENDER
    }),
    AuthModule,
    UserModule,
  ],  
  controllers: [],
  providers: [],
})

export class AppModule implements NestModule {
   configure(consumer:MiddlewareConsumer){
     consumer.apply(jwtMiddleware)
     .forRoutes({ path: '/graphql', method: RequestMethod.ALL })
   }
}
