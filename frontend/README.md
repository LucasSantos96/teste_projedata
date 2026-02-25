# Inventory Frontend

React application for inventory and production planning. It manages products, raw materials, product/raw-material composition, and displays production suggestions from the API.

## Features

- **RF001 - Product Management:** create, list, update, and delete products.
- **RF002 - Raw Material Management:** create, list, update, and delete raw materials.
- **RF003 - Product/Raw Material Association:** define required raw materials per product.
- **RF004 - Production Suggestions:** display producible quantities and projected values based on current stock.

## Tech Stack

- Node.js **20+**
- React **19.2.0**
- TypeScript **5.9**
- Vite **7.3.1**
- Redux Toolkit **2.11.2** + React Redux
- React Router DOM **7.13.1**
- Tailwind CSS **4.2.1**
- Vitest + Testing Library
- Cypress **15.11.0**

## Project Architecture

Frontend layered flow:

`Page Components -> Redux Slices (Async Thunks) -> Service Layer -> REST API`

- **Pages** handle UI interactions, forms, feedback messages, and modal/dialog states.
- **Redux slices** centralize async loading/mutation states and success/error feedback.
- **Services** isolate HTTP communication and map backend payload variations into frontend types.
- **API layer** (`apiRequest`) standardizes headers, parses errors, and reads base URL from environment.

## Navigation Routes

- `/products` - Product CRUD screen.
- `/raw-materials` - Raw material CRUD screen.
- `/composition` - Product composition management by selected product.
- `/production` - Production suggestions and summary values.

## API Integration

Environment variable:

- `VITE_API_BASE_URL` (default fallback: `http://localhost:8080`)

Create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Consumed endpoints:

- `GET /products`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `GET /raw-materials`
- `POST /raw-materials`
- `PUT /raw-materials/{id}`
- `DELETE /raw-materials/{id}`
- `GET /products/{productId}/raw-materials`
- `POST /products/{productId}/raw-materials`
- `PUT /products/{productId}/raw-materials/{compositionId}`
- `DELETE /products/{productId}/raw-materials/{compositionId}`
- `GET /production/suggestions`

## API Compatibility Notes

Service mappers support multiple backend response shapes (array/object wrappers and alternative field names), for example:

- Product fields: `id | productId`, `code | productCode`, `name | productName`.
- Raw material fields: `stockQuantity | stock_quantity | quantityInStock | quantity`.
- Production fields: `maxProducibleQuantity | producibleQuantity | quantityPossible`.

For composition listing, `404/405` is treated as an empty list to keep UI resilient while backend endpoints evolve.

## How to Run

1. Install dependencies:

```bash
npm install
```

2. Configure API URL:

```bash
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local
```

3. Start development server:

```bash
npm run dev
```

Default frontend URL: `http://localhost:5173`

## Build & Preview

Build for production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Testing

Unit/integration tests (Vitest):

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

E2E tests (Cypress):

```bash
npx cypress run
```

Open Cypress UI:

```bash
npx cypress open
```

Current Cypress specs:

- `cypress/e2e/products.spec.cy.ts`
- `cypress/e2e/raw-materials.spec.cy.ts`
- `cypress/e2e/composition.spec.cy.ts`
- `cypress/e2e/production.spec.cy.ts`

Current Vitest specs:

- `src/services/api.test.ts`
- `src/pages/ProductsPage.integration.test.tsx`
- `src/pages/ProductionPage.integration.test.tsx`
- `src/utils/format.test.ts`

## Lint

```bash
npm run lint
```

## Error Handling

- Network failures are mapped to a friendly message: `Unable to connect to the server. Please check the API URL.`
- HTTP errors use backend message payload when available.
- Page-level retry actions are available on load failures.
- Mutation feedback is displayed for create/update/delete operations.
- Deleting raw materials linked to composition shows a specific conflict-oriented message.
