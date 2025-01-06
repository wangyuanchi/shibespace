# shibespaceAPI Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [/health](#health)
   - [/users](#users)
   - [/threads](#threads)
   - [/comments](#comments)
4. [Errors](#errors)

---

## Introduction

- **Name**: shibespaceAPI
- **Description**: This API provides a set of **RESTful** endpoints to perform CRUD (Create, Read, Update, and Delete) operations on a database. It allows clients to manage forum-related data such as users, threads and comments.
- **Version**: `v1.0`
- **Base URL**: `/v1`
- **Required Headers**: `content-type: application/json`

---

## Authentication

This API uses **JSON Web Tokens (JWT)** for authentication. Users must log in at the `/users/auth` endpoint to receive the JWT, which will be automatically set as a cookie, and will expire in **1 hour**. Once expired, users will need to log in again to obtain a new token.

---

## Endpoints

### health

#### `GET /health`

**Description:** Checks whether the server is alive.
**Example Response:**

```json
HTTP/1.1 200 OK
{}
```

### users

- [POST /users](#post-users)
- [POST /users/auth](#post-usersauth)
- [GET /users/{user_id}](#get-usersuser_id)

#### `POST /users`

**Description:** Creates a user.
**Example Request:**

```json
{
  "username": "admin",
  "password": "abcde123"
}
```

**Attribute Requirements:**

- `username` _string_: Must be between 3 and 20 characters long
- `password` _string_: Must be at least 8 characters long

**Example Response:**

```json
HTTP/1.1 201 Created
{
  "id": "00000000-0000-0000-0000-000000000000",
  "username": "admin"
}
```

**Relevant Errors:**
`HTTP/1.1 409 Conflict`: Username is already taken

#### `POST /users/auth`

**Description:** Authenticates a user.
**Example Request:**

```json
{
  "username": "admin",
  "password": "abcde123"
}
```

**Attribute Requirements:**

- `username` _string_
- `password` _string_

**Example Response:**

```json
HTTP/1.1 200 OK
Set-Cookie: jwt=<Header>.<Payload>.<Signature>; HttpOnly
{
  "username": "admin"
}
```

**Relevant Errors:**
`HTTP/1.1 401 Unauthorized`: The username or password is incorrect

#### `GET /users/{user_id}`

**Description:** Gets a single user.
**Authentication Requirements:** Users can only get their own information.
**Parameter Requirements:** NA

**Example Response:**

```json
HTTP/1.1 200 OK
{
  "id": "00000000-0000-0000-0000-000000000000",
  "username": "admin"
}
```

**Relevant Errors:**
`HTTP/1.1 401 Unauthorized`: Please refer to [authentication errors](#authentication-errors).

### threads

- [POST /threads](#post-threads)
- [GET /threads](#get-threads)
- [GET /threads/{thread_id}](#get-threadsthread_id)
- [PATCH /threads/{thread_id}/content](#patch-threadsthread_idcontent)
- [DELETE /threads/{thread_id}](#delete-threadsthread_id)

#### `POST /threads`

**Description:** Creates a thread.
**Authentication Requirements:** User must be authenticated at the point of creation.
**Example Request:**

```json
{
  "title": "Cool Title",
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "tags": ["important", "starred"]
}
```

**Attribute Requirements:**

- `title` _string_: Must be between 1 and 255 characters long
- `content` _string_: Must be at least 1 character long
- `tags` _string[]_: Must have at most 5 elements, with the length of each element between 1 and 35 characters long

**Example Response:**

```json
HTTP/1.1 201 Created
{
  "id": 1,
  "title": "Cool Title",
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "tags": ["important", "starred"],
  "creator_id": "00000000-0000-0000-0000-000000000000",
  "created_timestamp": "1970-01-01 00:00:00",
  "updated_timestamp": "1970-01-01 00:00:00",
}
```

**Relevant Errors:**
`HTTP/1.1 400 Bad Request`: tags slice cannot be nil, please provide an empty slice of strings
`HTTP/1.1 401 Unauthorized`: Please refer to [authentication errors](#authentication-errors).

#### `GET /threads`

**Description:** Gets threads based on the supplied queries, they are sorted based on the latest updated thread.
**Query Requirements:**

- `tags` _Default: []_: Must have at most 5 string segments separated with commas (CSV), with the length of each segment between 1 and 35 characters long
- `page` _Default: 1_: String must be convertable to an integer that has a value of at least 1
- `limit` _Default: 10_: String must be convertable to an integer that has a value of at least 1

**Example Request URLs:**

> /threads
> /threads?tags=important,starred&page=1&limit=1

**Example Response:**

```json
HTTP/1.1 200 OK
[
    {
    "id": 1,
    "title": "Cool Title",
    "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "tags": ["important", "starred"],
    "creator_id": "00000000-0000-0000-0000-000000000000",
    "created_timestamp": "1970-01-01 00:00:00",
    "updated_timestamp": "1970-01-01 00:00:00",
    }
]
```

```json
HTTP/1.1 204 No Content
```

#### `GET /threads/{thread_id}`

**Description:** Gets a single thread.
**Parameter Requirements:** `thread_id` must be convertable to an integer

**Example Response:**

```json
HTTP/1.1 200 OK
{
  "id": 1,
  "title": "Cool Title",
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "tags": ["important", "starred"],
  "creator_id": "00000000-0000-0000-0000-000000000000",
  "created_timestamp": "1970-01-01 00:00:00",
  "updated_timestamp": "1970-01-01 00:00:00",
}
```

**Relevant Errors:**
`HTTP/1.1 404 Not Found`: The thread does not exist

#### `PATCH /threads/{thread_id}/content`

**Description:** Updates the content of a thread.
**Authentication Requirements:** Users can only update the content of threads created by them.
**Parameter Requirements:** `thread_id` must be convertable to an integer

**Example Request:**

```json
{
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
}
```

**Attribute Requirements:**

- `content` _string_: Must be at least 1 character long

**Example Response:**

```json
HTTP/1.1 200 OK
{
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "updated_timestamp": "1970-01-01 00:00:00"
}
```

**Relevant Errors:**
`HTTP/1.1 401 Unauthorized`: Please refer to [authentication errors](#authentication-errors).
`HTTP/1.1 404 Not Found`: The thread does not exist

#### `DELETE /threads/{thread_id}`

**Description:** Deletes a thread.
**Authentication Requirements:** Users can only delete threads created by them.
**Parameter Requirements:** `thread_id` must be convertable to an integer

**Example Response:**

```json
HTTP/1.1 204 No Content
```

**Relevant Errors:**
`HTTP/1.1 401 Unauthorized`: Please refer to [authentication errors](#authentication-errors).
`HTTP/1.1 404 Not Found`: The thread does not exist

### comments

- [POST /comments](#post-comments)
- [GET /comments](#get-comments)
- [PATCH /comments/{comment_id}/content](#patch-commentscomment_idcontent)
- [DELETE /comments/{comment_id}](#delete-commentscomment_id)

#### `POST /comments`

**Description:** Creates a comment.
**Authentication Requirements:** User must be authenticated at the point of creation.
**Example Request:**

```json
{
  "content": "that is so cool",
  "thread_id": 1
}
```

**Attribute Requirements:**

- `content` _string_: Must be at least 1 character long
- `thread_id` _int_

**Example Response:**

```json
HTTP/1.1 201 Created
{
  "id": 1,
  "content": "that is so cool",
  "thread_id": 1,
  "creator_id": "00000000-0000-0000-0000-000000000000",
  "created_timestamp": "1970-01-01 00:00:00",
  "updated_timestamp": "1970-01-01 00:00:00",
}
```

**Relevant Errors:**
`HTTP/1.1 401 Unauthorized`: Please refer to [authentication errors](#authentication-errors).
`HTTP/1.1 404 Not Found`: The thread does not exist

#### `GET /comments`

**Description:** Gets comments based on the supplied queries, they are sorted based on the first created comment.
**Query Requirements:**

- `thread_id` _Compulsory_: String must be convertable to an integer
- `page` _Default: 1_: String must be convertable to an integer that has a value of at least 1
- `limit` _Default: 10_: String must be convertable to an integer that has a value of at least 1

**Example Request URLs:**

> /comments?thread_id=1
> /comments?thread_id=1&page=1&limit=1

**Example Response:**

```json
HTTP/1.1 200 OK
[
    {
    "id": 1,
    "content": "that is so cool",
    "thread_id": 1,
    "creator_id": "00000000-0000-0000-0000-000000000000",
    "created_timestamp": "1970-01-01 00:00:00",
    "updated_timestamp": "1970-01-01 00:00:00",
    }
]
```

```json
HTTP/1.1 204 No Content
```

**Relevant Errors:**
`HTTP/1.1 404 Not Found`: The thread does not exist

#### `PATCH /comments/{comment_id}/content`

**Description:** Updates the content of a comment.
**Authentication Requirements:** Users can only update the content of comments created by them.
**Parameter Requirements:** `comment_id` must be convertable to an integer

**Example Request:**

```json
{
  "content": "this is not cool"
}
```

**Attribute Requirements:**

- `content` _string_: Must be at least 1 character long

**Example Response:**

```json
HTTP/1.1 200 OK
{
  "content": "this is not cool",
  "updated_timestamp": "1970-01-01 00:00:00"
}
```

**Relevant Errors:**
`HTTP/1.1 401 Unauthorized`: Please refer to [authentication errors](#authentication-errors).
`HTTP/1.1 404 Not Found`: The comment does not exist

#### `DELETE /comments/{comment_id}`

**Description:** Deletes a comment.
**Authentication Requirements:** Users can only delete comments created by them.
**Parameter Requirements:** `comment_id` must be convertable to an integer

**Example Response:**

```json
HTTP/1.1 204 No Content
```

**Relevant Errors:**
`HTTP/1.1 401 Unauthorized`: Please refer to [authentication errors](#authentication-errors).
`HTTP/1.1 404 Not Found`: The comment does not exist

---

## Errors

All errors will have a consistent formatting as shown below.

**Example Response:**

```json
HTTP/1.1 500 Internal Server Error
{
    "error": "Something went wrong, please try again later"
}
```

### Server Errors

`HTTP/1.1 500 Internal Server Error`: Something went wrong, please try again later

### Authentication Errors

`HTTP/1.1 401 Unauthorized`: cookie 'jwt' is not found
`HTTP/1.1 401 Unauthorized`: failed to parse jwt
`HTTP/1.1 401 Unauthorized`: invalid token
`HTTP/1.1 401 Unauthorized`: mismatch between user ID from jwt and target ID
