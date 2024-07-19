# Book API

Welcome to the **Book API** repository! This API allows you to manage a collection of books with features for creating, updating, retrieving, and deleting books. It also supports pagination and filtering.

## Purpose

This API is designed for testers to test the functionality of the endpoints, ensure that the API behaves as expected, and identify any issues during local development and remote deployment.

## Features

- **CRUD Operations**: Create, Read, Update, Delete books.
- **Pagination**: Retrieve books with pagination support.
- **Filtering**: Filter books by title, description, and pages.
- **Authentication**: Secure endpoints with token-based authentication.
- **Validation**: Ensure data integrity with comprehensive validation rules.

## Endpoints

### Authentication

#### POST /login

**Description**: Authenticate users and receive a JWT token.

**Request Body**:
```json
{
  "username": "your-username",
  "password": "your-password"
}
```

**Responses**:
```json
200 OK: { "token": "your-jwt-token" }
401 Unauthorized: Invalid credentials.

```

# Books Management
## POST /books
### Description: Create a new book.

**Request Body**:
```json
{
  "title": "Book Title",
  "description": "Book Description",
  "pages": 300
}
```

**Responses**:
```json
201 Created: The created book object.
400 Bad Request: Validation errors or if id is provided.
```

## PUT /books/
### Description: Replace a book with a new representation.
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "pages": 350
}
```


**Responses**:

* 200 OK: The updated book object.
* 400 Bad Request: Missing fields or trying to update id.
* 404 Not Found: Book with the specified id does not exist.


## PATCH /books/
### Description: Apply partial updates to a book.

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "pages": 350
}
```

## DELETE /books/
### Description: Delete a specific book.

**Responses**:

* 204 No Content: Book successfully deleted.
* 404 Not Found: Book with the specified id does not exist.

## DELETE /books
### Description: Delete all books.

**Responses**:

* 204 No Content: All books successfully deleted.
* Pagination & Filtering


## GET /books-pages
### Description: Retrieve books with pagination.

**Query Parameters**:

* page: Page number (default: 1)
* limit: Number of books per page (default: 10)

**Responses**:

* 200 OK: List of books for the specified page.

## GET /books/filter/title
### Description: Filter books by title.

**Query Parameters**:

* title: Title to filter by

**Responses**:

* 200 OK: List of books matching the title filter.

## GET /books/filter/description
### Description: Filter books by description.

**Query Parameters**:

* description: Description to filter by

**Responses**:

* 200 OK: List of books matching the description filter.


## GET /books/filter/pages
## Description: Filter books by number of pages.

**Query Parameters**:

* pages: Number of pages to filter by

**Responses**:

* 200 OK: List of books matching the pages filter.


## Setup

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/book-api.git
    ```
2. Navigate to the project directory:
    ```bash
    cd book-api
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

### Running the Project

To start the API server, run:
```bash
npm run dev
```

### The server will be running at http://localhost:3000.

## Environment Variables
**Create a .env file in the root directory and add the following variables**:
```
SECRET_KEY=your-secret-key
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
```


## Dependencies
* Express: Fast, unopinionated, minimalist web framework for Node.js.
* TypeScript: Superset of JavaScript that compiles to plain JavaScript.
* Swagger: API documentation tool.
* jsonwebtoken: JSON Web Token implementation.
* uuid: Library to generate unique identifiers.
* fs-extra: Extension of Node.js fs module with more functionality.

## Contributing
Feel free to contribute to this project! Please fork the repository and submit pull requests with your improvements or bug fixes.