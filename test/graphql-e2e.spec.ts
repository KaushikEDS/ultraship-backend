import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('GraphQL E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.enableCors();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Authentication', () => {
    it('should register an admin user', async () => {
      const mutation = `
        mutation {
          register(input: {
            username: "admin"
            password: "admin123"
            role: ADMIN
          }) {
            accessToken
            user {
              id
              username
              role
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.register).toBeDefined();
      expect(response.body.data.register.accessToken).toBeDefined();
      expect(response.body.data.register.user.role).toBe('ADMIN');
      adminToken = response.body.data.register.accessToken;
    });

    it('should register an employee user', async () => {
      const mutation = `
        mutation {
          register(input: {
            username: "employee"
            password: "employee123"
            role: EMPLOYEE
          }) {
            accessToken
            user {
              id
              username
              role
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.register).toBeDefined();
      expect(response.body.data.register.user.role).toBe('EMPLOYEE');
      employeeToken = response.body.data.register.accessToken;
    });

    it('should login with valid credentials', async () => {
      const mutation = `
        mutation {
          login(input: {
            username: "admin"
            password: "admin123"
          }) {
            accessToken
            user {
              username
              role
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.login).toBeDefined();
      expect(response.body.data.login.accessToken).toBeDefined();
    });

    it('should fail login with invalid credentials', async () => {
      const mutation = `
        mutation {
          login(input: {
            username: "admin"
            password: "wrongpassword"
          }) {
            accessToken
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Employee Mutations (Admin Only)', () => {
    let createdEmployeeId: string;

    it('should create an employee as admin', async () => {
      const mutation = `
        mutation {
          addEmployee(input: {
            name: "John Doe"
            age: 30
            class: "10A"
            subjects: ["Math", "Physics"]
            attendance: {}
          }) {
            id
            name
            age
            class
            subjects
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.addEmployee).toBeDefined();
      expect(response.body.data.addEmployee.name).toBe('John Doe');
      expect(response.body.data.addEmployee.age).toBe(30);
      createdEmployeeId = response.body.data.addEmployee.id;
    });

    it('should fail to create an employee as regular employee', async () => {
      const mutation = `
        mutation {
          addEmployee(input: {
            name: "Jane Doe"
            age: 25
            class: "10B"
            subjects: ["Chemistry"]
          }) {
            id
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ query: mutation })
        .expect(200);

      expect(response.body.errors).toBeDefined();
    });

    it('should update an employee as admin', async () => {
      const mutation = `
        mutation {
          updateEmployee(id: "${createdEmployeeId}", input: {
            name: "John Smith"
            age: 31
          }) {
            id
            name
            age
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.updateEmployee).toBeDefined();
      expect(response.body.data.updateEmployee.name).toBe('John Smith');
      expect(response.body.data.updateEmployee.age).toBe(31);
    });
  });

  describe('Employee Queries (All Authenticated Users)', () => {
    it('should get all employees as employee', async () => {
      const query = `
        query {
          employees {
            id
            name
            age
            class
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.data.employees).toBeDefined();
      expect(Array.isArray(response.body.data.employees)).toBe(true);
    });

    it('should get paginated employees', async () => {
      const query = `
        query {
          employeesPaginated(pagination: {
            limit: 10
            offset: 0
            sortBy: "name"
            sortOrder: ASC
          }) {
            items {
              id
              name
              age
            }
            total
            hasMore
            currentPage
            totalPages
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.data.employeesPaginated).toBeDefined();
      expect(response.body.data.employeesPaginated.items).toBeDefined();
      expect(response.body.data.employeesPaginated.total).toBeDefined();
    });

    it('should filter employees by class', async () => {
      const query = `
        query {
          employees(filter: { class: "10A" }) {
            id
            name
            class
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.data.employees).toBeDefined();
      response.body.data.employees.forEach((emp) => {
        expect(emp.class).toBe('10A');
      });
    });

    it('should fail to query without authentication', async () => {
      const query = `
        query {
          employees {
            id
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Me Query', () => {
    it('should get current user info', async () => {
      const query = `
        query {
          me {
            id
            username
            role
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.data.me).toBeDefined();
      expect(response.body.data.me.username).toBe('admin');
      expect(response.body.data.me.role).toBe('ADMIN');
    });
  });
});

