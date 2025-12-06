# Employee Management GraphQL API

A production-ready GraphQL API built with NestJS, TypeORM, and PostgreSQL for employee management with role-based authentication and performance optimizations.

## Features

- **GraphQL API** with Apollo Server
- **Role-Based Access Control** (Admin & Employee roles)
- **JWT Authentication** with secure password hashing
- **PostgreSQL Database** with TypeORM
- **Advanced Filtering & Pagination** with sorting
- **Performance Optimizations** including DataLoader, query complexity limits, and database indexing
- **Comprehensive Testing** (Unit & E2E tests)
- **Docker Support** for PostgreSQL

## Tech Stack

- **Framework**: NestJS
- **API**: GraphQL (Apollo Server)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (passport-jwt)
- **Language**: TypeScript
- **Testing**: Jest, Supertest

## Data Model

### Employee
- ID (UUID)
- Name (string)
- Age (integer, 18-100)
- Class (string)
- Subjects (array of strings)
- Attendance (JSON object)
- Timestamps (createdAt, updatedAt)

### User
- ID (UUID)
- Username (string, unique)
- Password (hashed)
- Role (ADMIN | EMPLOYEE)
- Timestamps (createdAt, updatedAt)

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ultraship-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL with Docker**

```bash
docker-compose up -d
```

5. **Run the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The GraphQL Playground will be available at: `http://localhost:3000/graphql`

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## GraphQL API Usage

### Authentication

#### Register a new user

```graphql
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
```

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

#### Get current user

```graphql
query {
  me {
    id
    username
    role
  }
}
```

**Note**: Add the token to the Authorization header for authenticated requests:
```
Authorization: Bearer <your-jwt-token>
```

### Employee Queries

#### Get all employees (with optional filters)

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
    subjects
    attendance
  }
}
```

#### Get single employee

```graphql
query {
  employee(id: "uuid-here") {
    id
    name
    age
    class
    subjects
    attendance
    createdAt
    updatedAt
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
      subjects
    }
    total
    hasMore
    currentPage
    totalPages
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
    subjects: ["Math", "Physics", "Chemistry"]
    attendance: {
      "2024-01-01": true,
      "2024-01-02": false
    }
  }) {
    id
    name
    age
    class
    subjects
  }
}
```

#### Update employee

```graphql
mutation {
  updateEmployee(
    id: "uuid-here"
    input: {
      name: "Jane Doe"
      age: 31
      class: "10B"
    }
  ) {
    id
    name
    age
    class
  }
}
```

#### Delete employee

```graphql
mutation {
  deleteEmployee(id: "uuid-here") {
    id
    name
  }
}
```

## Access Control

### Role-Based Permissions

**Admin Role:**
- Create employees
- Update employees
- Delete employees
- View all employees
- Access all queries

**Employee Role:**
- View all employees
- Access read-only queries
- Cannot create, update, or delete

## Performance Optimizations

This API implements several performance optimizations:

1. **Database Indexing**: Indexes on frequently queried fields (name, class, username)
2. **Query Complexity Limiting**: Prevents malicious deep queries (max 1000 complexity)
3. **DataLoader**: Batches and caches database queries to prevent N+1 problems
4. **Pagination**: Limits result set size (max 100 items per page)
5. **Connection Pooling**: Efficient database connection management
6. **Bounded Cache**: Apollo Server caches parsed queries

See [PERFORMANCE.md](PERFORMANCE.md) for detailed information.

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── dto/              # Input/Output types
│   ├── entities/         # User entity
│   ├── guards/           # JWT and Roles guards
│   ├── strategies/       # Passport JWT strategy
│   ├── auth.service.ts
│   ├── auth.resolver.ts
│   └── auth.module.ts
├── employee/             # Employee module
│   ├── dto/             # Input/Output types
│   ├── entities/        # Employee entity
│   ├── employee.service.ts
│   ├── employee.resolver.ts
│   └── employee.module.ts
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── enums/          # Shared enums
│   ├── plugins/        # GraphQL plugins
│   └── dataloaders/    # DataLoader implementations
├── config/             # Configuration files
│   ├── database.config.ts
│   └── graphql.config.ts
├── app.module.ts       # Root module
└── main.ts            # Application entry point
```

## Environment Variables

See `.env.example` for all available configuration options:

- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRATION`: Token expiration time
- `NODE_ENV`: Environment (development/production)
- `PORT`: Application port
- `GRAPHQL_PLAYGROUND`: Enable/disable GraphQL Playground

## Docker Support

Start PostgreSQL with Docker Compose:

```bash
docker-compose up -d
```

Stop PostgreSQL:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f postgres
```

## License

This project is [MIT licensed](LICENSE).
