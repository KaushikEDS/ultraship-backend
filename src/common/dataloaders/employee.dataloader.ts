import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';

@Injectable({ scope: Scope.REQUEST })
export class EmployeeDataLoader {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  public readonly batchEmployees = new DataLoader<number, Employee | null>(
    async (employeeIds: readonly number[]) => {
      const employees = await this.employeeRepository.find({
        where: { id: In([...employeeIds]) },
      });

      const employeeMap = new Map(employees.map((emp) => [emp.id, emp]));

      return employeeIds.map((id) => employeeMap.get(id) || null);
    },
  );
}

