import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../auth/entities/user.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { Role } from '../../common/enums/role.enum';

export async function runSeeds(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const employeeRepository = dataSource.getRepository(Employee);

  console.log('🌱 Seeding database...');

  // Create admin user
  const adminExists = await userRepository.findOne({
    where: { username: 'admin' },
  });

  if (!adminExists) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      username: 'admin',
      password: adminPassword,
      role: Role.ADMIN,
    });
    await userRepository.save(admin);
    console.log('✅ Admin user created (username: admin, password: admin123)');
  } else {
    console.log('⏭️  Admin user already exists');
  }

  // Create employee user
  const employeeUserExists = await userRepository.findOne({
    where: { username: 'employee' },
  });

  if (!employeeUserExists) {
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employeeUser = userRepository.create({
      username: 'employee',
      password: employeePassword,
      role: Role.EMPLOYEE,
    });
    await userRepository.save(employeeUser);
    console.log(
      '✅ Employee user created (username: employee, password: employee123)',
    );
  } else {
    console.log('⏭️  Employee user already exists');
  }

  // Create sample employees
  const employeeCount = await employeeRepository.count();

  if (employeeCount === 0) {
    const sampleEmployees = [
      {
        name: 'John Doe',
        age: 30,
        class: '10A',
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        attendance: {
          '2024-01-01': true,
          '2024-01-02': true,
          '2024-01-03': false,
        },
      },
      {
        name: 'Jane Smith',
        age: 28,
        class: '10A',
        subjects: ['English', 'History', 'Geography'],
        attendance: {
          '2024-01-01': true,
          '2024-01-02': false,
          '2024-01-03': true,
        },
      },
      {
        name: 'Bob Johnson',
        age: 32,
        class: '10B',
        subjects: ['Mathematics', 'Computer Science'],
        attendance: {
          '2024-01-01': true,
          '2024-01-02': true,
          '2024-01-03': true,
        },
      },
      {
        name: 'Alice Williams',
        age: 29,
        class: '10B',
        subjects: ['Biology', 'Chemistry', 'Physics'],
        attendance: {
          '2024-01-01': false,
          '2024-01-02': true,
          '2024-01-03': true,
        },
      },
      {
        name: 'Charlie Brown',
        age: 35,
        class: '11A',
        subjects: ['Art', 'Music'],
        attendance: {
          '2024-01-01': true,
          '2024-01-02': true,
          '2024-01-03': false,
        },
      },
    ];

    for (const empData of sampleEmployees) {
      const employee = employeeRepository.create(empData);
      await employeeRepository.save(employee);
    }

    console.log(`✅ Created ${sampleEmployees.length} sample employees`);
  } else {
    console.log(`⏭️  Employees already exist (${employeeCount} found)`);
  }

  console.log('✨ Seeding completed!');
}

