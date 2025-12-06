import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateEmployeeInput } from './create-employee.input';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateEmployeeInput extends PartialType(CreateEmployeeInput) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  age?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  class?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  attendance?: Record<string, boolean>;
}

