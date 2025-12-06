import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@Entity('employees')
@ObjectType()
@Index(['name'])
@Index(['class'])
export class Employee {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field(() => Int)
  age: number;

  @Column()
  @Field()
  class: string;

  @Column('simple-array')
  @Field(() => [String])
  subjects: string[];

  @Column({ type: 'json', default: '{}' })
  @Field(() => GraphQLJSON)
  attendance: Record<string, boolean>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}

