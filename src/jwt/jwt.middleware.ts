import { Injectable, NestMiddleware } from '@nestjs/common';
import { ok } from 'src/common/common.result-const';
import { UserService } from 'src/user/user.service';
import { JwtService } from './jwt.service';


@Injectable()
export class jwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService:JwtService,
    private readonly userService:UserService

  ){}
  async use(req: any, res: any, next: () => void) {
    try {
      if ('x-jwt' in req.headers) {
        const token = req.headers['x-jwt'];        
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          
            const {result,user} = await this.userService.findById(decoded['id']);
            
            if(result === ok){
              req['user'] = user;    
            }
            
        }
      }
    } catch (e) {

    } finally {
      next();
    }
    
  }
  

}