import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { SortOrder } from './dto/pagination.input';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let repository: Repository<Employee>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockEmployee: Employee = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    age: 30,
    class: '10A',
    subjects: ['Math', 'Physics'],
    attendance: { '2024-01-01': true },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    repository = module.get<Repository<Employee>>(getRepositoryToken(Employee));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const createEmployeeInput: CreateEmployeeInput = {
        name: 'John Doe',
        age: 30,
        class: '10A',
        subjects: ['Math', 'Physics'],
        attendance: { '2024-01-01': true },
      };

      mockRepository.create.mockReturnValue(mockEmployee);
      mockRepository.save.mockResolvedValue(mockEmployee);

      const result = await service.create(createEmployeeInput);

      expect(mockRepository.create).toHaveBeenCalledWith(createEmployeeInput);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEmployee);
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne(mockEmployee.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEmployee.id },
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      const updateEmployeeInput: UpdateEmployeeInput = {
        name: 'Jane Doe',
        age: 31,
      };

      const updatedEmployee = { ...mockEmployee, ...updateEmployeeInput };

      mockRepository.findOne.mockResolvedValue(mockEmployee);
      mockRepository.save.mockResolvedValue(updatedEmployee);

      const result = await service.update(mockEmployee.id, updateEmployeeInput);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEmployee.id },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateEmployeeInput.name);
    });
  });

  describe('remove', () => {
    it('should remove an employee', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmployee);
      mockRepository.remove.mockResolvedValue(mockEmployee);

      const result = await service.remove(mockEmployee.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEmployee.id },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockEmployee);
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('findPaginated', () => {
    it('should return paginated employees', async () => {
      const pagination = {
        limit: 10,
        offset: 0,
        sortBy: 'name',
        sortOrder: SortOrder.ASC,
      };

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[mockEmployee], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findPaginated(pagination);

      expect(result.items).toEqual([mockEmployee]);
      expect(result.total).toEqual(1);
      expect(result.hasMore).toBeFalsy();
      expect(result.currentPage).toEqual(1);
      expect(result.totalPages).toEqual(1);
    });
  });
});

