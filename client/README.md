# shibespace showcase

## Table of Contents

1. [Responsive Design](#responsive-design)
2. [Authentication](#authentication)
3. [Tags and Pagination](#tags-and-pagination)
4. [Basic Functionalities](#basic-functionalities)

---

### Responsive web design

The example below shows how a thread would look for different screens.

![responsive.png](/client/src/assets/responsive.png)

---

### Authentication

Upon login, a JSON web token is sent to the client, and for every action which requires authentication that a user carries out, this token is sent together in the request.

Effort was put in to prevent instances where a user can carry out an action which they are not authenticated for.

Examples include, but are not limited to:

- "New Thread" button is not displayed for logged out users
- Comment box not displayed for logged out users
- Edit and delete buttons not shown to non-creators

However, if a user still manages to bypass the system, there is error handling in place and appropriate indications back to the user.

![authentication.png](/client/src/assets/authentication.png)

---

### Tags and Pagination

Every thread can have at most 5 tags, which the user can define on creation of the thread. These tags can be filtered, which allow other users to find a thread more easily.

Both threads and comments are paginated, with a maximum of 10 instances on a single page.

![tags-and-pagination.png](/client/src/assets/tags-and-pagination.png)

### Basic Functionalities

The basic functionalities include CRUD operations on threads and comments. Their behaviour is similar and some examples are shown below.

![basic-functionalities.png](/client/src/assets/basic-functionalities.png)
