import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRestaurantDto } from 'src/restaurant/dto/create-restaurant.dto';
import { UpdateRestaurantDto } from 'src/restaurant/dto/update-restaurant.dto';
import { Restaurant } from 'src/restaurant/entity/restaurant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository(Restaurant) 
        private readonly restaurants:Repository<Restaurant>
    ){}

    getAll():Promise<Restaurant[]>{
        return this.restaurants.find();
    }

    createRestaurant(createRestaurantDto:CreateRestaurantDto):Promise<Restaurant>{
        const newRestaurant = this.restaurants.create(createRestaurantDto);
        return this.restaurants.save(newRestaurant);
    }

    updateRestaurant(updateDto:UpdateRestaurantDto){
         this.restaurants.update(updateDto.id,{...updateDto});
        
    }
}