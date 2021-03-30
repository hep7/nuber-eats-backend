import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurant/entity/restaurant.entity';
import { RestaurantResolver } from './restaurant.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
    imports:[TypeOrmModule.forFeature([Restaurant])],
    providers:[RestaurantResolver,RestaurantService]
})
export class RestaurantModule {}
