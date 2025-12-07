# Employee Management GraphQL API

A GraphQL API built with NestJS, TypeORM, and MariaDB for employee management with role-based authentication.

## Features

- GraphQL API with Apollo Server
- JWT Authentication with role-based access control
- Employee CRUD operations
- Advanced filtering, pagination, and sorting
- Performance optimizations (DataLoader, query complexity limits, database indexing)

## Tech Stack

- **Framework**: NestJS
- **API**: GraphQL (Apollo Server)
- **Database**: MariaDB
- **ORM**: TypeORM
- **Authentication**: JWT (passport-jwt)
- **Language**: TypeScript

## Data Model

### Employee
- ID (auto-increment integer)
- Name (string)
- Age (integer, 18-100)
- Class (string)
- Subjects (array of strings)
- Attendance (JSON object)
- Timestamps (createdAt, updatedAt)

### User
- ID (auto-increment integer)
- Username (string, unique)
- Password (hashed)
- Role (ADMIN | EMPLOYEE)
- Timestamps (createdAt, updatedAt)

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MariaDB database
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/KaushikEDS/ultraship-backend.git
cd ultraship-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Run the application**

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start:prod
```

The GraphQL Playground will be available at: `http://localhost:3000/graphql`

5. **Seed the database** (optional)

```bash
npm run seed
```

This creates:
- Admin user: `admin` / `admin123`
- Employee user: `employee` / `employee123`
- 5 sample employees

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## GraphQL API Usage

### Authentication

#### Login

```graphql
mutation {
  login(input: {
    username: "admin"
    password: "admin123"
  }) {
    accessToken
    user {
      id
      username
      role
    }
  }
}
```

#### Register

```graphql
mutation {
  register(input: {
    username: "newuser"
    password: "password123"
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
```

**Note**: Add the token to the Authorization header for authenticated requests:
```
Authorization: Bearer <your-jwt-token>
```

### Employee Queries

#### Get all employees

```graphql
query {
  employees {
    id
    name
    age
    class
    subjects
  }
}
```

#### Get single employee

```graphql
query {
  employee(id: 1) {
    id
    name
    age
    class
    subjects
    attendance
  }
}
```

#### Get paginated employees

```graphql
query {
  employeesPaginated(
    pagination: {
      limit: 10
      offset: 0
      sortBy: "name"
      sortOrder: ASC
    }
    filter: {
      class: "10A"
    }
  ) {
    items {
      id
      name
      age
      class
    }
    total
    hasMore
    currentPage
    totalPages
  }
}
```

#### Filter employees

```graphql
query {
  employees(filter: {
    name: "John"
    class: "10A"
    minAge: 25
    maxAge: 35
    subject: "Math"
  }) {
    id
    name
    age
    class
  }
}
```

### Employee Mutations (Admin Only)

#### Add employee

```graphql
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
  }
}
```

#### Update employee

```graphql
mutation {
  updateEmployee(
    id: 1
    input: {
      name: "Jane Doe"
      age: 31
    }
  ) {
    id
    name
    age
  }
}
```

#### Delete employee

```graphql
mutation {
  deleteEmployee(id: 1) {
    id
    name
  }
}
```

## Access Control

**Admin Role:**
- Create, update, delete employees
- View all employees

**Employee Role:**
- View employees (read-only)
- Cannot create, update, or delete

## Environment Variables

Required environment variables:

- `DB_HOST` - MariaDB host
- `DB_PORT` - MariaDB port (default: 3306)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_SSL` - Enable SSL (true/false)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRATION` - Token expiration time
- `NODE_ENV` - Environment (development/production)
- `PORT` - Application port
- `GRAPHQL_PLAYGROUND` - Enable GraphQL Playground

## Deployment

This project is configured for Vercel deployment. See `vercel.json` for configuration.

## License

MIT
