# Omnibite Service

A robust and scalable backend service for Omnibite, built with [NestJS](https://nestjs.com/).

## Features

- **Framework**: [NestJS](https://nestjs.com/) for scalable server-side architecture
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT & Passport for secure endpoint access
- **Testing**: Unit and E2E testing configured with [Vitest](https://vitest.dev/)
- **Linting & Formatting**: ESLint and Prettier for consistent code style

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later recommended)
- PostgreSQL database

## Project Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory and configure your environment variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/omnibite?schema=public"
   JWT_SECRET="your-secret-key"
   ```

3. **Database Setup:**
   Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma generate
   npx prisma migrate dev

   # push database schema
   npx prisma db push

   # seed database
   npx prisma db seed
   ```

## Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Testing

```bash
# unit tests
npm run test

# watch mode
npm test -- --watch

# test coverage
npm run test:cov

# e2e tests
npm run test:e2e
```

## Useful Commands

- `npm run format`: Format code using Prettier
- `npm run lint`: Lint code using ESLint
- `npm run build`: Build the application for production

## License

This project is UNLICENSED.
