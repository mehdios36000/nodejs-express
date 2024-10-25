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
   - `PORT`: The port number to run the Express server.
   - `JWT_SECRET`: Secret key for JWT-based authentication.
   - `DB_STRING`: PostgreSQL connection URI for Prisma.
   - `HOST`: The root URL for the API.

## Default Prisma Schema

The default Prisma schema includes a `User` model with predefined fields, including a role setup with `ADMIN` as the default. You can extend this schema according to your project needs.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DB_STRING")
}

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

## CRUD Generation for New Tables

You can create new tables with corresponding routes, controllers, and services using the command:

```bash
yarn crud:generate [table_name] [field:type1,field:type2,...]
```

### Field Types
The following `Joi` types are supported for validation:
- `string`: `string()`
- `int`: `number()`
- `date`: `date()`
- `double`: `number()`
- `boolean`: `boolean()`
- `id`: `string()`
- `fid`: `string()`
- `array`: `array()`
- `text`: `string()`
- `object`: `object()`

### Route Access
By default, all generated routes require the `ADMIN` role for access. You can customize access permissions as needed.

## Authentication

This template uses **JWT** for authentication. Ensure you set a strong `JWT_SECRET` value in the environment variables to secure token generation.

Here's an addition to the `README.md` with a command to generate a `JWT_SECRET` using `bcrypt` in Node.js:

---

## Generating a JWT_SECRET

To generate a secure `JWT_SECRET` for your environment, use the following command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will generate a  hash that can be used as your `JWT_SECRET`. Copy the output and paste it into your environment variable file under `JWT_SECRET`.



## Additional Resources

For more information, refer to:
- [Prisma Documentation](https://pris.ly/d/prisma-schema)
- [Express Documentation](https://expressjs.com/)
- [jsonwebtoken Documentation](https://www.npmjs.com/package/jsonwebtoken)
