import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from 'src/restaurant/dto/create-restaurant.dto';
import { UpdateRestaurantDto } from 'src/restaurant/dto/update-restaurant.dto';
import { Restaurant } from 'src/restaurant/entity/restaurant.entity';
import { RestaurantService } from './restaurants.service';


@Resolver(of => Restaurant)
export class RestaurantResolver{
    constructor(private readonly restaurnatService:RestaurantService){}
    @Query(returns=>[Restaurant])
    restaurants():Promise<Restaurant[]>{
        return this.restaurnatService.getAll();
    }

    @Mutation(returns=>Boolean)
    async createRestaurant(@Args('input') createRestaurantDto:CreateRestaurantDto):Promise<boolean>{
        console.log(createRestaurantDto);
        try{

            await this.restaurnatService.createRestaurant(createRestaurantDto);
            return true;

        }catch(e){
            console.log(e);
            return false;
        }
    }

    @Mutation(returns=>Boolean)
    async updateRestaurant(
        @Args('input') updateRestaurantDto:UpdateRestaurantDto
    ){
        try{
            await this.restaurnatService.updateRestaurant(updateRestaurantDto);
            return true;
        }catch(e){
            console.log(e);
            return false;
        }
        
    }
}
