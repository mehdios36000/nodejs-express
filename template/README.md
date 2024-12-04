# Node.js Express TypeScript Template

A modern, feature-rich template for building scalable Node.js applications with Express and TypeScript.

## 🚀 Features

- **TypeScript** - Write better, more maintainable code
- **Express** - Fast, unopinionated web framework
- **Prisma** - Next-generation ORM for Node.js and TypeScript
- **Interactive CLI Tools** - Easy CRUD operations and project setup
- **JWT Authentication** - Secure role-based authentication
- **Input Validation** - Request validation using Joi
- **Error Handling** - Centralized error handling
- **API Documentation** - OpenAPI/Swagger documentation with automatic generation
- **Environment Variables** - Secure configuration management
- **Code Formatting** - ESLint and Prettier setup
- **HTTP Status Codes** - Standard HTTP status codes using http-status-codes
- **CORS** - Cross-Origin Resource Sharing enabled
- **Rate Limiting** - API rate limiting support
- **Email Support** - SMTP email integration
- **API Monitoring** - Express status monitor integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Yarn or npm

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nodejs-express.git
   cd nodejs-express
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Run the interactive setup:
   ```bash
   yarn init:prisma
   ```
   This will:
   - Set up your environment variables
   - Configure user roles
   - Initialize the database connection
   - Set up JWT authentication

## 🎯 Available Scripts

- **Development**
  ```bash
  yarn dev          # Start development server
  ```

- **Production**
  ```bash
  yarn build        # Build the project
  yarn start        # Start production server
  ```

- **Database**
  ```bash
  yarn prisma:generate   # Generate Prisma client
  yarn prisma:migrate    # Run database migrations
  yarn prisma:studio    # Open Prisma Studio
  ```

- **CRUD Operations**
  ```bash
  yarn crud:generate    # Generate new CRUD module interactively
  yarn crud:delete     # Delete existing CRUD module interactively
  ```

## 🏗️ Project Structure

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

## 🛡️ Environment Variables

Create a `.env` file in the root directory. The setup script will help you configure these variables:

```env
NODE_ENV=development
PORT=3000
HOST=localhost
DB_STRING=postgres://...
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
CORS_ORIGIN=*
API_RATE_LIMIT=100
```

## 🔐 Authentication

The template includes JWT-based authentication with role-based access control. Available roles can be configured during setup.

## 📝 API Documentation

The API documentation is automatically generated using OpenAPI/Swagger specifications. When running in development mode:

1. Access the interactive API documentation at:
   ```
   http://localhost:3000/api-docs
   ```

2. View the raw OpenAPI specification at:
   ```
   http://localhost:3000/api-docs.json
   ```

### Documentation Features:

- **Interactive UI**: Test API endpoints directly from the browser
- **Authentication**: Built-in JWT authentication support
- **Schema Validation**: Request/response validation schemas
- **Auto-Generation**: Documentation is automatically generated for new CRUD modules
- **Type Safety**: TypeScript integration ensures documentation accuracy

### Adding Documentation:

1. For routes, use JSDoc comments with Swagger annotations:
   ```typescript
   /**
    * @swagger
    * /api/users:
    *   get:
    *     summary: Get all users
    *     tags: [Users]
    *     responses:
    *       200:
    *         description: List of users
    */
   ```

2. For models, add them to `src/docs/schemas.yml`:
   ```yaml
   components:
     schemas:
       User:
         type: object
         properties:
           id:
             type: string
             format: uuid
   ```

3. The CRUD generator automatically adds OpenAPI documentation for new entities.

## 🛠️ CRUD Generation

### Creating a New CRUD Module

```bash
yarn crud:generate
```

This interactive tool will:
1. Ask for the entity name
2. Guide you through adding fields
3. Generate:
   - Controller with OpenAPI documentation
   - Service layer
   - Routes
   - Input validation
   - TypeScript interfaces
   - API documentation

### Deleting a CRUD Module

```bash
yarn crud:delete
```

This will:
1. Show a list of existing modules
2. Remove selected module's files
3. Clean up route registrations
4. Update API documentation




