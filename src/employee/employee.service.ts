import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { EmployeeFilterInput } from './dto/employee-filter.input';
import { PaginationInput, SortOrder } from './dto/pagination.input';
import { PaginatedEmployeeResponse } from './dto/paginated-employee.response';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeInput: CreateEmployeeInput): Promise<Employee> {
    const employee = this.employeeRepository.create(createEmployeeInput);
    return this.employeeRepository.save(employee);
  }

  async findAll(filter?: EmployeeFilterInput): Promise<Employee[]> {
    const query = this.employeeRepository.createQueryBuilder('employee');

    this.applyFilters(query, filter);

    return query.getMany();
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findPaginated(
    pagination: PaginationInput,
    filter?: EmployeeFilterInput,
  ): Promise<PaginatedEmployeeResponse> {
    const { limit, offset, sortBy, sortOrder } = pagination;

    const query = this.employeeRepository.createQueryBuilder('employee');

    // Apply filters
    this.applyFilters(query, filter);

    // Apply sorting
    const order = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';
    query.orderBy(`employee.${sortBy}`, order);

    // Apply pagination
    query.skip(offset).take(limit);

    // Get results and count
    const [items, total] = await query.getManyAndCount();

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const hasMore = offset + limit < total;

    return {
      items,
      total,
      hasMore,
      currentPage,
      totalPages,
    };
  }

  async update(
    id: number,
    updateEmployeeInput: UpdateEmployeeInput,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    Object.assign(employee, updateEmployeeInput);

    return this.employeeRepository.save(employee);
  }

  async remove(id: number): Promise<Employee> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
    return employee;
  }

  private applyFilters(query: any, filter?: EmployeeFilterInput): void {
    if (!filter) return;

    if (filter.name) {
      query.andWhere('employee.name ILIKE :name', {
        name: `%${filter.name}%`,
      });
    }

    if (filter.class) {
      query.andWhere('employee.class = :class', { class: filter.class });
    }

    if (filter.minAge !== undefined) {
      query.andWhere('employee.age >= :minAge', { minAge: filter.minAge });
    }

    if (filter.maxAge !== undefined) {
      query.andWhere('employee.age <= :maxAge', { maxAge: filter.maxAge });
    }

    if (filter.subject) {
      query.andWhere(':subject = ANY(employee.subjects)', {
        subject: filter.subject,
      });
    }
  }
}

