import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from 'src/restaurant/entity/restaurant.entity';


@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant,['id']){

}
