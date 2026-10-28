# Transaction Ledger API

A RESTful transaction ledger API built with **Node.js, Express, TypeScript, PostgreSQL, and Sequelize**. It supports account management, credit/debit transactions, balance tracking, and transaction history.

## Features

- Create accounts with an initial balance of `0.00`.
- Credit and debit transactions.
- Reject transactions with invalid amounts.
- Prevent debits that exceed the available balance.
- Prevent duplicate transaction reference IDs within the same account.
- Update the account balance and create the transaction record atomically.
- Retrieve account balances.
- Retrieve transaction history with type filtering and pagination.
- Return transactions in newest-first order.
- Use database migrations to manage the schema.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Sequelize ORM
- sequelize-cli for database migrations

## Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- Git

## Installation

Clone the repository and enter the project directory:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd transaction-ledger-api
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the project root:

```env
PORT=3002
DATABASE_URL=postgres://<username>:<password>@localhost:5432/transaction_ledger
```

Replace the database username and password with your local PostgreSQL credentials.

**Do not commit `.env` or expose database credentials.**

## Database Setup

Create a PostgreSQL database named `transaction_ledger`, or update `DATABASE_URL` to use your database.

Run the migrations:

```bash
npm run db:migrate
```

To check migration status:

```bash
npm run db:migrate:status
```

To undo the latest migration:

```bash
npm run db:migrate:undo
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Build the TypeScript project:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

The default server port is `3002`. If configured, the application health endpoint is:

```http
GET /health
```

## API Endpoints

### 1. Create an Account

```http
POST /accounts
Content-Type: application/json
```

Request:

```json
{
  "name": "Test Account"
}
```

The server generates the account ID and creation timestamp. The initial balance is always zero.

### 2. Create a Credit or Debit Transaction

```http
POST /accounts/:id/transactions
Content-Type: application/json
```

Example credit request:

```json
{
  "type": "credit",
  "amount": 500,
  "description": "Initial deposit",
  "reference_id": "TXN-1001"
}
```

Use `"debit"` as the transaction type for withdrawals.

Validation rules:

- `type` must be `credit` or `debit`.
- `amount` must be positive and have at most two decimal places.
- `description` is required.
- `reference_id` is required and must be unique within the account.
- A debit cannot exceed the available balance.

### 3. Get Account Balance

```http
GET /accounts/:id/balance
```

Example response:

```json
{
  "account_id": "1",
  "balance": "500.00"
}
```

### 4. Get Transaction History

```http
GET /accounts/:id/transactions
```

Optional query parameters:

- `type`: `credit` or `debit`
- `page`: page number, starting at `1`
- `limit`: number of records per page, from `1` to `100`

Example:

```http
GET /accounts/1/transactions?type=credit&page=1&limit=10
```

The response includes the account ID, transaction records, and pagination metadata. Results are sorted newest first.

## Error Handling

The API uses appropriate HTTP status codes for common errors, including:

- `400 Bad Request` — invalid input, invalid transaction type, invalid amount, or insufficient balance.
- `404 Not Found` — account not found.
- `409 Conflict` — duplicate transaction reference.
- `500 Internal Server Error` — unexpected server error.

Error responses include an error identifier and a message describing the issue.

## Transaction Integrity

- Each transaction belongs to an account.
- A database uniqueness constraint prevents duplicate reference IDs within an account.
- The account balance update and transaction insertion use the same database transaction.
- Account-row locking helps serialize concurrent balance changes.
- The API does not expose transaction update or delete endpoints.

## Assumptions

- Each new account starts with a balance of zero.
- Transaction amounts are positive and use two decimal places at most.
- Reference IDs are unique per account, not globally.
- Transaction history is read-only through the API.
- Monetary values are stored using PostgreSQL decimal types.

## License

Add a license if one is required for this project.
