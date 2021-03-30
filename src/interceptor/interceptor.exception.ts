import {
  Injectable,
  NestInterceptor,
  ExecutionContext,  
  CallHandler,
} from '@nestjs/common';
import * as util from 'util';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    return next
      .handle()
      .pipe(
        catchError(err => {
          // const arg = context.getArgs();
          // console.log(util.inspect(context, false, null))          
          // console.log(context.getHandler());
          // Error.captureStackTrace(err);          
          console.log(context);
          return throwError(err);
        }),
      );
  }
}
