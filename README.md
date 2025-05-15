# Developer Reports CRUD API

A personal side-project that serves a simple CRUD for Developers and Reports. This is the result of the challenge of creating a simple application following best practices and clean architectures.

The goal of this project is to build a database of developers and then create report files with the developer registered data.

## Table of contents

- [Features](#features)
- [Bounded Contexts](#bounded-contexts)
- [Why this project?](#why-this-project)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker Commands](#docker-commands)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Available Endpoints](#available-endpoints)
- [Author](#author)

## Features

- Developer management (CRUD operations)
- Developer report generation (by this time reports are dummy)

## Bounded Contexts

This project is divided into the following bounded contexts:

- [Developers](./src/modules/developers): Contains the developer aggregate root and the developer repository.
- [Reports](./src/modules/reports): Contains the CRUD functionalities for creating and getting reports
- [Report Templates](./src/modules/report-templates): Contains the different reports that can be generated and the logic to extract the data and writing it into a file.

## Why this project?

This project is a simple API with simple CRUD developed for academic purposes. This contains some proof of concept for some best practices in the development of a NestJS API. This application tries to architecture a large scale application with a hexagonal architecture.

The idea behind this project is to offer an API for creating a database of developers and their metrics. This would be used to generate report files with these metrics. By now, only the developers CRUD operations and dummy reports are implemented.

## Prerequisites

- Node.js (v22.8.0 or later)
- Docker and Docker Compose
- npm (10.8.2 or later)
- PostgreSQL (if running locally. You can use the configured docker)
- AWS Account (if running locally. You can use docker for mocking the AWS services)

## Project Setup

1. Install dependencies:

```bash
$ npm install
```

2. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Set required environment variables

3. Start infrastructure services with Docker:

```bash
$ npm run docker:up
```

This will start all the services needed for the application to work (PostgreSQL, AWS S3, AWS SNS, AWS SQS)

## Running the Application

There are different ways to run the application.

#### Development mode

```bash
$ npm run dev
```

#### Watch mode (auto-reload)

```bash
$ npm run dev:watch
```

#### Development mode using docker

```bash
$ npm run build:docker
$ npm run start:docker
```

#### Production mode

```bash
$ npm run build
$ npm run start
```

#### Debug mode

```bash
$ npm run build
$ npm run start:debug
```

## Testing

This application is covered with multiple tests of different types (unit, integration, e2e). To do so uses jest and supertest. For running the tests you can use the following commands:

#### Unit tests

```bash
$ npm run test
```

#### Watch mode for unit tests

```bash
$ npm run test:watch
```

#### Integration tests

```bash
$ npm run test:int
```

#### E2E tests

```bash
$ npm run test:e2e
```

#### Test coverage

```bash
$ npm run test:cov
```

## Docker Commands

#### Start container for dependencies

```bash
$ npm run docker:up
```

#### Stop containers (all)

```bash
$ npm run docker:down
```

#### Restart containers (only dependencies)

```bash
$ npm run docker:restart
```

#### Stop API container

```bash
$ npm run stop:docker
```

## Project Structure

```
src/
├── modules/ # Feature modules
│ └── developers/ # Developer module
│ └── report-templates/ # Report templates module
│ └── reports/ # Reports module
├── server/ # Server configuration
├── shared/ # Shared utilities and core functionality
└── main.ts # Application entry point
```

## Architecture

- Follows Domain-Driven Design (DDD) principles
- Implements Hexagonal Architecture (Ports and Adapters)
- Uses SOLID principles
- Implements Repository pattern for data access
- Event-driven architecture using AWS SNS/SQS
- Contains a comprehensive testing suite (Unit, Integration, E2E)
- Docker containerization
- AWS services integration (S3, SNS, SQS)
- PostgreSQL database
- Structured logging system
- Preserves linting and formating

## Available Endpoints

You can see the availble endpoints in the swagger file. You can generate it by running the following command:

```bash
$ npm run docs:swagger
```

You will find the swagger documentation in the `docs/swagger.json` file.

### Troubleshooting

#### I run docker:up and the AWS Resources are not being created

If you are running the docker and the aws-init is not running properly or throwing some syntax error from init.sh it could be due to an inproper Windows formatting.

Try executing

```bash
$ sed -i 's/\r$//' ./docker/config/localstack/init.sh
```

And running again the docker

## Author

Jose M Malaguilla
