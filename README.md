# Leftovers API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## Description

Leftovers API is a powerful backend service designed to combat food waste by connecting businesses, organizations, and individuals who have surplus food with those who need it. Built with NestJS, this API provides a robust foundation for managing food donations, tracking inventory, and facilitating the redistribution of surplus food items.

## Key Features

- **Food Inventory Management**: Track and manage surplus food items
- **Donation System**: Facilitate food donations between businesses and organizations
- **Real-time Updates**: Keep track of available food items and their status
- **User Management**: Secure authentication and authorization for different user roles
- **Location-based Services**: Find nearby food sources and distribution points
- **Analytics Dashboard**: Track food waste reduction metrics and impact

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Package Manager**: pnpm

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- PostgreSQL
- Docker (optional)

## Installation

```bash
# Clone the repository
$ git clone https://github.com/AuraTechDev/leftovers-api

# Install dependencies
$ pnpm install

# Set up environment variables
$ cp .env.example .env

# Generate Prisma Client
$ pnpm prisma generate

# Run database migrations
$ pnpm prisma migrate dev
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/leftovers
JWT_SECRET=your_jwt_secret
PORT=3000
```


## Running the DB Container

```bash
# Development mode
$ docker-compose --env-file env_file_path up -d

```


## Running the Application

```bash
# Development mode
$ pnpm start:dev

# Production mode
$ pnpm start:prod

# Build the application
$ pnpm build
```

## API Documentation

Once the application is running, you can access the API documentation at:

```
http://localhost:3000/api/docs
```

## Testing

```bash
# Unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# Test coverage
$ pnpm test:cov
```

## Docker Support

```bash
# Build and run with Docker
$ docker-compose up -d
```

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the powerful ORM
- All contributors who help make this project better
- Organizations fighting against food waste worldwide

## Contact

For any questions or suggestions, please open an issue in the repository or contact the maintainers.
