# Quick Start Guide

Get up and running with the Employee Management GraphQL API in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- Docker installed and running

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL Database

```bash
docker-compose up -d
```

Wait a few seconds for PostgreSQL to start. Check status:

```bash
docker-compose ps
```

### 3. Setup Environment Variables

The `.env` file is already created with default values for development. If needed, you can modify it:

```bash
# .env is already configured with:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=employee_db
JWT_SECRET=ultra-secret-jwt-key-for-development-only-change-in-production
JWT_EXPIRATION=1h
NODE_ENV=development
PORT=3000
GRAPHQL_PLAYGROUND=true
```

### 4. Seed the Database

Populate the database with sample data (users and employees):

```bash
npm run seed
```

This creates:
- **Admin user**: `username: admin`, `password: admin123`
- **Employee user**: `username: employee`, `password: employee123`
- **5 sample employees** with various data

### 5. Start the Application

```bash
npm run start:dev
```

The server will start at `http://localhost:3000`

### 6. Open GraphQL Playground

Navigate to: **http://localhost:3000/graphql**

## Your First Queries

### 1. Login as Admin

In the GraphQL Playground, run this mutation:

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

**Copy the `accessToken` from the response.**

### 2. Set Authorization Header

At the bottom of GraphQL Playground, click "HTTP HEADERS" and add:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

Replace `YOUR_TOKEN_HERE` with the token you copied.

### 3. Query All Employees

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

### 4. Get Paginated Employees

```graphql
query {
  employeesPaginated(pagination: {
    limit: 5
    offset: 0
    sortBy: "name"
    sortOrder: ASC
  }) {
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

### 5. Create a New Employee (Admin Only)

```graphql
mutation {
  addEmployee(input: {
    name: "Sarah Connor"
    age: 35
    class: "12A"
    subjects: ["Computer Science", "Mathematics"]
    attendance: {}
  }) {
    id
    name
    age
    class
    subjects
  }
}
```

### 6. Filter Employees

```graphql
query {
  employees(filter: {
    class: "10A"
    minAge: 25
    maxAge: 35
  }) {
    id
    name
    age
    class
  }
}
```

## Test Role-Based Access Control

### Login as Employee User

```graphql
mutation {
  login(input: {
    username: "employee"
    password: "employee123"
  }) {
    accessToken
    user {
      username
      role
    }
  }
}
```

Update the Authorization header with this new token.

### Try to Create Employee (Should Fail)

```graphql
mutation {
  addEmployee(input: {
    name: "Test User"
    age: 30
    class: "10A"
    subjects: ["Math"]
  }) {
    id
    name
  }
}
```

**Expected**: You'll get an authorization error because regular employees can't create employees - only admins can!

### But You Can Read Data

```graphql
query {
  employees {
    id
    name
    class
  }
}
```

**Expected**: This works! Employee users can view employee data.

## Stopping the Application

### Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

### Stop PostgreSQL

```bash
docker-compose down
```

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Port Already in Use

If port 3000 is already in use, change it in `.env`:

```
PORT=4000
```

### Database Schema Issues

If you need to reset the database:

```bash
# Stop containers
docker-compose down

# Remove volumes (this deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d
npm run seed
```

## Next Steps

- Read [README.md](README.md) for complete API documentation
- Check [PERFORMANCE.md](PERFORMANCE.md) for performance optimizations
- Run tests with `npm test` or `npm run test:e2e`
- Explore all GraphQL queries and mutations in the Playground

## Need Help?

- Check the GraphQL schema in the Playground (click "DOCS" on the right)
- All queries and mutations have descriptions
- Review error messages - they're descriptive!

Enjoy building with the Employee Management API! 🚀

