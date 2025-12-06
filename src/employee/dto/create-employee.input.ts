import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateEmployeeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Int)
  @IsInt()
  @Min(18)
  @Max(100)
  age: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  class: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  subjects: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  attendance?: Record<string, boolean>;
}

