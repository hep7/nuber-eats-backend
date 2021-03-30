import { ValidationPipe } from '@nestjs/common';
import {  NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filter/filter.all-exception';
import { ErrorsInterceptor } from './interceptor/interceptor.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);  
  app.useGlobalInterceptors(new ErrorsInterceptor());
  app.useGlobalPipes(new ValidationPipe());  
  app.useGlobalFilters(new AllExceptionsFilter());
  
  await app.listen(3000);
}
bootstrap();
