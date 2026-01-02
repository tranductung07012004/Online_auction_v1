# Online Auction Platform

A full-stack online auction platform built with microservices architecture, enabling users to buy and sell products through real-time bidding.

## Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Socket.io** for real-time communication

### Backend
- **Java Spring Boot** microservices
- **PostgreSQL** databases (2 separate databases)
- **Apache Kafka** for message queuing
- **Docker Compose** for infrastructure

## Architecture

The platform consists of multiple microservices:

- **Gateway Service**: API gateway for routing requests
- **User Service**: Handles authentication and user management
- **Main Service**: Manages products, auctions, bids, and orders
- **Worker Service**: Background job processing

## Features

- User authentication and authorization
- Product listing and management
- Real-time auction bidding
- Shopping cart and checkout
- Order management and tracking
- Admin dashboard
- Seller request system
- Photography service booking
- Real-time chat support

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Docker and Docker Compose

### Setup

1. Start infrastructure services:
```bash
docker-compose up -d
```

2. Start backend services (run each service separately):
```bash
cd gateway && ./mvnw spring-boot:run
cd user && ./mvnw spring-boot:run
cd main && ./mvnw spring-boot:run
cd worker && ./mvnw spring-boot:run
```

3. Start frontend:
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
Online_auction/
├── frontend/          # React frontend application
├── gateway/           # API Gateway service
├── user/              # User service (auth & user management)
├── main/              # Main service (products, auctions, orders)
├── worker/            # Worker service (background jobs)
├── docker-compose.yml # Infrastructure setup
└── db*.sql           # Database initialization scripts
```


