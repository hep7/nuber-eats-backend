import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { Restaurant } from 'src/restaurant/entity/restaurant.entity'
import { CreateRestaurantDto } from './create-restaurant.dto';


// @InputType()
// export class UpdateRestaurantInputType extends PartialType(
//   CreateRestaurantDto,
// ) {}


@InputType()
export class UpdateRestaurantDto extends PartialType(OmitType(Restaurant,['id'] ))  {
    @Field(type => Number)
    id: number;

}