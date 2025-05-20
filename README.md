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

## Running the DB Container

```bash
# Build and run with Docker
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

# Environment Variables Setup

To run this project locally, you need to create a `.env` file in the root directory with the following variables:

## Core
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/yourdb
```

## JWT Auth
```
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

## Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GOOGLE_SCOPE=email,profile
```

## Apple OAuth
```
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
APPLE_CALLBACK_URL=http://localhost:3000/auth/apple/callback
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY_LOCATION=path/to/key
APPLE_SCOPE=name,email
```

## Cloudinary (for file uploads)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

**Note:**
- Replace all placeholder values with your actual credentials.
- For OAuth, you may need to register your app with Google and Apple to obtain the client IDs and secrets.
- The `GOOGLE_SCOPE` and `APPLE_SCOPE` can be a comma-separated list of scopes required by your app.
- The `DATABASE_URL` should point to your local or development database instance.

---

For more details on each variable, see the `src/config/env.config.ts` file.
