import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { EmployeeFilterInput } from './dto/employee-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedEmployeeResponse } from './dto/paginated-employee.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Employee)
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  // Queries - Accessible to all authenticated users

  @Query(() => [Employee], {
    name: 'employees',
    description: 'Get all employees with optional filters',
  })
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Args('filter', { type: () => EmployeeFilterInput, nullable: true })
    filter?: EmployeeFilterInput,
  ): Promise<Employee[]> {
    return this.employeeService.findAll(filter);
  }

  @Query(() => Employee, {
    name: 'employee',
    description: 'Get a single employee by ID',
  })
  @UseGuards(JwtAuthGuard)
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @Query(() => PaginatedEmployeeResponse, {
    name: 'employeesPaginated',
    description: 'Get paginated list of employees with sorting and filtering',
  })
  @UseGuards(JwtAuthGuard)
  async findPaginated(
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
    @Args('filter', { type: () => EmployeeFilterInput, nullable: true })
    filter?: EmployeeFilterInput,
  ): Promise<PaginatedEmployeeResponse> {
    return this.employeeService.findPaginated(pagination, filter);
  }

  // Mutations - Admin only

  @Mutation(() => Employee, {
    name: 'addEmployee',
    description: 'Create a new employee (Admin only)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Args('input', { type: () => CreateEmployeeInput })
    createEmployeeInput: CreateEmployeeInput,
  ): Promise<Employee> {
    return this.employeeService.create(createEmployeeInput);
  }

  @Mutation(() => Employee, {
    name: 'updateEmployee',
    description: 'Update an existing employee (Admin only)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Args('id', { type: () => Int }) id: number,
    @Args('input', { type: () => UpdateEmployeeInput })
    updateEmployeeInput: UpdateEmployeeInput,
  ): Promise<Employee> {
    return this.employeeService.update(id, updateEmployeeInput);
  }

  @Mutation(() => Employee, {
    name: 'deleteEmployee',
    description: 'Delete an employee (Admin only)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Args('id', { type: () => Int }) id: number): Promise<Employee> {
    return this.employeeService.remove(id);
  }
}

