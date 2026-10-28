# Transaction Ledger API --- API Documentation

## 1. Overview

A RESTful API for account management, credit/debit transactions, balance
tracking, and transaction history.

**Technology:** Node.js, Express, TypeScript, PostgreSQL, Sequelize\
**Local base URL:** `http://localhost:3002`\
**Content type:** `application/json`

> Replace the local base URL with the deployed URL if the application is
> deployed.

## 2. Endpoints

  ------------------------------------------------------------------------------
  Method                  Endpoint                       Description
  ----------------------- ------------------------------ -----------------------
  `GET`                   `/health`                      Check whether the API
                                                         is running

  `POST`                  `/accounts`                    Create an account

  `POST`                  `/accounts/:id/transactions`   Create a credit or
                                                         debit transaction

  `GET`                   `/accounts/:id/balance`        Retrieve an account's
                                                         current balance

  `GET`                   `/accounts/:id/transactions`   Retrieve transaction
                                                         history with optional
                                                         filtering and
                                                         pagination
  ------------------------------------------------------------------------------

## 3. Health Check

### `GET /health`

Checks API health.

**Example request**

``` http
GET /health
```

The health endpoint is implemented in the application. Refer to its
actual response in the running API.

## 4. Create Account

### `POST /accounts`

Creates an account. The account ID and creation timestamp are generated
by the server. The initial balance is always `0.00`.

**Request body**

``` json
{
  "name": "Test Account"
}
```

**Success response:** `201 Created`

The response includes the generated account ID, account name, initial
balance, and creation timestamp.

**Validation**

-   `name` is required and must not be empty.

## 5. Create a Credit or Debit Transaction

### `POST /accounts/:id/transactions`

Creates a transaction for the specified account and updates its balance.

**Path parameter**

  Parameter   Description
  ----------- -------------
  `id`        Account ID

**Request body --- credit example**

``` json
{
  "type": "credit",
  "amount": 500,
  "description": "Initial deposit",
  "reference_id": "TXN-1001"
}
```

**Request body --- debit example**

``` json
{
  "type": "debit",
  "amount": 100,
  "description": "Cash withdrawal",
  "reference_id": "TXN-1002"
}
```

**Success response:** `201 Created`

The response contains the created transaction and the updated account
balance.

**Validation and business rules**

-   `type` must be `credit` or `debit`.
-   `amount` must be a positive number with at most two decimal places.
-   `description` is required.
-   `reference_id` is required.
-   A reference ID must be unique within the same account.
-   A debit is rejected if the available balance is insufficient.
-   The account balance update and transaction insertion are performed
    within the same database transaction.

## 6. Get Account Balance

### `GET /accounts/:id/balance`

Returns the current balance for an account.

**Example request**

``` http
GET /accounts/1/balance
```

**Example success response:** `200 OK`

``` json
{
  "account_id": "1",
  "balance": "340.00"
}
```

**Error response:** `404 Not Found` if the account does not exist.

## 7. Get Transaction History

### `GET /accounts/:id/transactions`

Returns transaction history for an account, newest first.

**Query parameters**

  -----------------------------------------------------------------------
  Parameter               Required                Description
  ----------------------- ----------------------- -----------------------
  `type`                  No                      Filter by `credit` or
                                                  `debit`

  `page`                  No                      Page number; defaults
                                                  to `1`

  `limit`                 No                      Records per page;
                                                  defaults to `10`,
                                                  allowed range
                                                  `1`--`100`
  -----------------------------------------------------------------------

**Example request**

``` http
GET /accounts/1/transactions?type=credit&page=1&limit=10
```

**Example response:** `200 OK`

``` json
{
  "account_id": "1",
  "transactions": [
    {
      "id": "3",
      "account_id": "1",
      "type": "credit",
      "amount": "100.00",
      "description": "Atomicity test",
      "reference_id": "ATOMIC-001",
      "created_at": "2026-10-28T12:51:34.844Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 10,
    "total_records": 2,
    "total_pages": 1
  }
}
```

The example values are illustrative. Actual records and totals depend on
the database contents.

**Validation**

-   `type`, when supplied, must be `credit` or `debit`.
-   `page` must be a positive integer.
-   `limit` must be between `1` and `100`.

## 8. Error Responses

The API returns JSON error objects. Common status codes include:

  HTTP status                   Meaning
  ----------------------------- -----------------------------------------------
  `400 Bad Request`             Invalid request input or insufficient balance
  `404 Not Found`               Account not found
  `409 Conflict`                Duplicate reference ID within an account
  `500 Internal Server Error`   Unexpected server error

**Example validation error**

``` json
{
  "error": "VALIDATION_ERROR",
  "message": "Type must be credit or debit."
}
```

**Example insufficient-balance error**

The API rejects a debit when the account does not have enough funds. The
exact response message is determined by the implementation.

## 9. Transaction Integrity and Immutability

-   Each transaction is associated with an account.
-   The database enforces uniqueness of `(account_id, reference_id)`.
-   The balance update and transaction insert use the same Sequelize
    database transaction.
-   The account row is locked during transaction processing to help
    serialize concurrent balance changes.
-   No transaction update or delete endpoints are exposed by the API.

## 10. Running Locally

Install dependencies:

``` bash
npm install
```

Create a `.env` file in the project root and configure the PostgreSQL
connection:

``` env
PORT=3002
DATABASE_URL=postgres://<username>:<password>@localhost:5432/transaction_ledger
```

Create the PostgreSQL database named `transaction_ledger` (or update the
connection string to your database), then run migrations:

``` bash
npm run db:migrate
```

Start the development server:

``` bash
npm run dev
```

Build and run the compiled application:

``` bash
npm run build
npm start
```

Do not commit `.env` or database credentials to version control.
