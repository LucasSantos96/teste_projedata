# Projedata Technical Test - Production and Inventory Control System

This repository contains the solution for Projedata's practical technical test to manage:

- Finished products
- Raw materials in stock
- Product-to-raw-material composition
- Production suggestions prioritized by highest-value products

## Challenge objective

An industry company needs to know:

- which products can be manufactured with the current raw material stock;
- how many units of each product can be produced;
- the total projected value from the suggested production plan.

The core business rule implemented is: **prioritize higher-value products** when raw materials are shared across multiple products.

## Solution architecture

The project follows a decoupled API + Frontend approach:

- **Backend:** Spring Boot REST API for business rules and persistence.
- **Frontend:** React application for CRUD operations and production suggestion visualization.
- **Database:** PostgreSQL.

### Repository structure

```text
.
├── backend/
│   └── inventory-api/    # Spring Boot API
└── frontend/             # React + Redux application
```

## Tech stack

- Backend: Java 17, Spring Boot, Spring Web MVC, Spring Data JPA, PostgreSQL, Maven
- Frontend: React 19, TypeScript, Vite, Redux Toolkit, Tailwind CSS
- Testing: JUnit/Mockito (backend), Vitest + Testing Library and Cypress (frontend)

## Covered requirements

### Functional requirements (RF)

- `RF001` - Product CRUD (backend and frontend)
- `RF002` - Raw material CRUD (backend and frontend)
- `RF003` - Product x raw material association CRUD (backend and frontend)
- `RF004` - Production suggestion query based on available stock (backend)
- `RF005` - Product CRUD UI (frontend)
- `RF006` - Raw material CRUD UI (frontend)
- `RF007` - UI for assigning raw materials to products (frontend)
- `RF008` - UI to list producible products and quantities (frontend)

### Non-functional requirements (RNF)

- `RNF001` - Web platform compatible with major browsers
- `RNF002` - Backend and frontend separated through API architecture
- `RNF003` - Responsive frontend screens (desktop/mobile)
- `RNF004` - Relational DBMS persistence (PostgreSQL)
- `RNF005` - API implemented with backend framework (Spring Boot)
- `RNF006` - Frontend implemented with modern framework (React + Redux Toolkit)
- `RNF007` - Code, entities, and technical naming in English

## Running locally

### Prerequisites

- Docker and Docker Compose
- Java 17+
- Node.js 20+

### 1) Start database and API (backend)

```bash
cd backend/inventory-api
docker compose up -d
./mvnw spring-boot:run
```

API available at: `http://localhost:8080`

### 2) Start frontend

In another terminal:

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local
npm run dev
```

Frontend available at: `http://localhost:5173`

## Main web application routes

- `/products`
- `/raw-materials`
- `/composition`
- `/production`

## Tests

### Backend

```bash
cd backend/inventory-api
./mvnw test
```

### Frontend (unit/integration)

```bash
cd frontend
npm run test
```

### Frontend (Cypress E2E)

```bash
cd frontend
npx cypress run
```

## Detailed module documentation

- Backend: [backend/inventory-api/README.md](backend/inventory-api/README.md)
- Frontend: [frontend/README.md](frontend/README.md)
