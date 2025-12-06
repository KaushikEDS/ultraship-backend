import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Employee } from '../entities/employee.entity';

@ObjectType()
export class PaginatedEmployeeResponse {
  @Field(() => [Employee])
  items: Employee[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;
}

