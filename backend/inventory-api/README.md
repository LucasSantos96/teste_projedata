# Inventory API

Spring Boot REST API for inventory and production planning. It manages products, raw materials, product-to-raw-material requirements, and calculates production suggestions based on available stock.

## Features

- **RF001 - Product Management:** create, list, get by id, update, and delete products.
- **RF002 - Raw Material Management:** create, list, get by id, update, and delete raw materials.
- **RF003 - Product/Raw Material Association:** define how much of a raw material is required to produce a product.
- **RF004 - Production Suggestions:** calculate producible quantities and projected value from current stock.

## Tech Stack

- Java **17**
- Spring Boot **4.0.3**
- Spring Web MVC
- Spring Data JPA
- Jakarta Validation
- PostgreSQL 16
- Lombok
- JUnit 5 + Mockito
- Maven Wrapper (`./mvnw`)

## Project Architecture

Layered architecture:

`Controller -> Service -> Repository -> Database`

- **Controllers** expose REST endpoints and validate request bodies.
- **Services** implement business rules and DTO mapping.
- **Repositories** use Spring Data JPA (`JpaRepository`).
- **Database** is PostgreSQL with schema managed by Hibernate (`ddl-auto=update`).

## Database & Docker

The repository provides PostgreSQL via Docker Compose.

`docker-compose.yml` configuration:

- Image: `postgres:16`
- Container: `inventory_postgres`
- Port: `5432:5432`
- Environment variables:
  - `POSTGRES_USER=inventory_user`
  - `POSTGRES_PASSWORD=inventory_pass`
  - `POSTGRES_DB=inventory_db`
- Volume: `postgres_data`

Application database properties (`src/main/resources/application.properties`):

- `spring.datasource.url=jdbc:postgresql://localhost:5432/inventory_db`
- `spring.datasource.username=inventory_user`
- `spring.datasource.password=inventory_pass`

## How to Run

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Run the API:

```bash
./mvnw spring-boot:run
```

3. Optional build:

```bash
./mvnw clean compile
```

Default base URL: `http://localhost:8080`

## API Endpoints

### Products

- `GET /products` - List all products.
- `GET /products/{id}` - Get one product by id.
- `POST /products` - Create a product.
- `PUT /products/{id}` - Update a product.
- `DELETE /products/{id}` - Delete a product.

**Request (POST/PUT)**

```json
{
  "code": "P-001",
  "name": "Product A",
  "price": 25.50
}
```

**Response**

```json
{
  "id": 1,
  "code": "P-001",
  "name": "Product A",
  "price": 25.50
}
```

### Raw Materials

- `GET /raw-materials` - List all raw materials.
- `GET /raw-materials/{id}` - Get one raw material by id.
- `POST /raw-materials` - Create a raw material.
- `PUT /raw-materials/{id}` - Update a raw material.
- `DELETE /raw-materials/{id}` - Delete a raw material.

**Request (POST/PUT)**

```json
{
  "code": "RM-001",
  "name": "Steel",
  "stockQuantity": 100
}
```

**Response**

```json
{
  "id": 1,
  "code": "RM-001",
  "name": "Steel",
  "stockQuantity": 100
}
```

### Product-RawMaterial Association

- `POST /products/{productId}/raw-materials` - Associate a raw material and required quantity to a product.

**Request**

```json
{
  "rawMaterialId": 1,
  "quantityRequired": 2.50
}
```

**Response**

```json
{
  "id": 1,
  "productId": 10,
  "productName": "Product A",
  "rawMaterialId": 1,
  "rawMaterialName": "Steel",
  "quantityRequired": 2.50
}
```

### Production Suggestions

- `GET /production/suggestions` - Return production suggestions from current stock.

**Response**

```json
{
  "suggestions": [
    {
      "productId": 10,
      "productCode": "P-EXP",
      "productName": "Expensive Product",
      "productPrice": 50.00,
      "maxProducibleQuantity": 3,
      "totalValue": 150.00
    }
  ],
  "totalProductsAnalyzed": 2
}
```

## Production Suggestion Rule

`ProductionService` applies the following flow:

1. Load all products and sort by **price descending**.
2. Build a mutable stock map from raw materials (`id -> stockQuantity`).
3. Group product/raw-material requirements by product.
4. For each product (highest price first):
   - Calculate `maxProducibleQuantity` using floor division of available stock by `quantityRequired` per required raw material.
   - Use the minimum producible quantity across required materials.
   - If quantity > 0, deduct consumed stock from the stock map.
   - Compute `totalValue = productPrice * maxProducibleQuantity` (scale 2, HALF_UP).
5. Return suggestion items plus `totalProductsAnalyzed`.

## Data Model

Entities and table names:

- `Product` -> table `products`
  - `id`, `code`, `name`, `price`
- `RawMaterial` -> table `raw_materials`
  - `id`, `code`, `name`, `stock_quantity`
- `ProductRawMaterial` -> table `product_raw_materials`
  - `id`, `product_id`, `raw_material_id`, `quantity_required`

## Testing

Test stack:

- JUnit 5
- Mockito (`@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`)
- Spring Boot Test (context load test)

Run tests:

```bash
./mvnw test
```

Current test classes:

- `InventoryApiApplicationTests` (Spring context load)
- `ProductServiceTest`
- `RawMaterialServiceTest`
- `ProductionServiceTest`

Coverage highlights:

- Product and Raw Material service unit tests for save/find/delete scenarios.
- Production service unit test for ordering, quantity calculation, and total value calculation.

## Error Handling

Global exception handling is implemented with `@ControllerAdvice` in `GlobalExceptionHandler`.

Handled exceptions:

- `MethodArgumentNotValidException` -> `400 Bad Request`
- `BusinessException` -> `400 Bad Request`
- `NotFoundException` -> `404 Not Found`
- Generic `Exception` -> `500 Internal Server Error`

Error response format (`ApiErrorResponse`):

```json
{
  "timestamp": "2026-02-25 10:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "code: Code is required",
  "path": "/products"
}
```

## Notes / Future Improvements

- Add pagination and filtering for list endpoints.
- Add OpenAPI/Swagger documentation.
- Add integration tests for controller and repository layers.
- Improve production suggestion service to avoid mutating repository-returned lists directly.
- Add authentication/authorization for protected operations.
