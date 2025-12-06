import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Field(() => Role, { defaultValue: Role.EMPLOYEE })
  @IsEnum(Role)
  role: Role;
}

