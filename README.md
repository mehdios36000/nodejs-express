# Node.js Express CRUD Template

This project template provides a **Node.js TypeScript** setup with **Express**, **Prisma**, and **jsonwebtoken (JWT)** for authentication. It includes an out-of-the-box **CRUD** setup and allows the generation of additional routes, controllers, and services for new database tables.

## Getting Started

To start a new project using this template, run:

```bash
npx nodejs-typescript-express-prisma
```

### Setup Instructions

Upon initialization, you will be prompted to provide specific project configurations:

1. **Roles**: Specify any custom roles you'd like to add, in addition to the default `ADMIN` role already configured in the schema. List roles in a comma-separated format, e.g., `ROLE1,ROLE2,...`.

2. **Environment Variables**: You will be prompted to set up the following environment variables:
   - `NODE_ENV`: Environment (development/production)
   - `PORT`: The port number to run the Express server
   - `JWT_SECRET`: Secret key for JWT-based authentication (auto-generated)
   - `DB_STRING`: PostgreSQL connection URI for Prisma
   - `HOST`: The root URL for the API
   - `SMTP_HOST`: SMTP server host for email
   - `SMTP_PORT`: SMTP server port
   - `SMTP_USER`: SMTP username
   - `SMTP_PASS`: SMTP password
   - `CORS_ORIGIN`: Allowed CORS origins
   - `API_RATE_LIMIT`: Rate limiting per minute

## Features

- ✨ Interactive CLI for CRUD operations
- 🔒 JWT Authentication with role-based access
- 📝 OpenAPI/Swagger documentation
- 🚀 TypeScript support
- 🗄️ Prisma ORM with PostgreSQL
- ✅ Input validation with Joi
- 🔍 Error handling middleware
- 📧 Email integration
- 🔄 API rate limiting
- 🌐 CORS support
- 📊 API monitoring

## CRUD Operations

### Generate New Module

```bash
yarn crud:generate
```

This interactive tool will guide you through:
1. Entity name selection
2. Field definitions with types
3. Generation of:
   - Controller with OpenAPI docs
   - Service layer
   - Routes
   - Validation schemas
   - TypeScript interfaces

### Delete Existing Module

```bash
yarn crud:delete
```

This will:
1. Show existing modules
2. Remove selected files
3. Clean up routes
4. Update documentation

### Available Field Types

- `string`: String data type
- `int`: Integer data type
- `date`: Date with timestamp
- `double`: Double/Float data type
- `boolean`: Boolean data type
- `id`: UUID primary key
- `fid`: UUID foreign key
- `array`: JSON array
- `object`: JSON object
- `text`: Text data type

## API Documentation

Documentation is automatically generated and available at:
- Interactive UI: `http://localhost:3000/api-docs`
- Raw OpenAPI spec: `http://localhost:3000/api-docs.json`

## Default Schema

```prisma
model User {
  id            String         @id @default(cuid())
  name          String?        @db.VarChar(255)
  password      String?        @db.VarChar(255)
  email         String?        @unique @db.VarChar(255)
  phoneNumber   String?        @default("0600000000") @map("phone_number") @db.VarChar(255)
  role          UserRolesEnum? @default(ADMIN)
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")
  @@map("users")
}

enum UserRolesEnum {
  ADMIN
}
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── docs/          # API documentation
│   ├── swagger.ts # Swagger configuration
│   └── *.yml     # API specifications
├── middlewares/    # Custom middlewares
├── routes/         # API routes
├── services/      # Business logic
├── utils/         # Utility functions
└── index.ts       # Application entry point
```

## Scripts

```json
{
  "scripts": {
    "dev": "nodemon -r tsconfig-paths/register src/index.ts",
    "build": "tsc --project tsconfig.json && tsc-alias -p tsconfig.json",
    "start": "node dist/index.js",
    "crud:generate": "ts-node ./scripts/crud-creation.ts",
    "crud:delete": "ts-node ./scripts/crud-deletion.ts",
    "init:prisma": "ts-node ./scripts/init-prisma.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

## Requirements

- Node.js v18 or higher
- PostgreSQL
- Yarn or npm
