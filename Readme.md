# Skill Exchange API

An Express and MongoDB API for connecting students who want to share skills and request help from one another.

## Features

- Student registration and login
- Cookie-based JWT authentication
- Student profile and skill management
- Help request creation, assignment, status updates, and deletion
- Admin login and management of students and help requests
- MongoDB persistence through Mongoose

## Tech Stack

- Node.js
- Express
- MongoDB and Mongoose
- JWT
- bcrypt
- cookie-parser

## Project Structure

| File | Purpose |
| --- | --- |
| `server.js` | Creates the Express server and mounts routers |
| `student.router.js` | Student accounts, profiles, skills, and requests |
| `admin.router.js` | Admin authentication and moderation operations |
| `student.model.js` | Student schema and model |
| `request.model.js` | Help request schema and model |
| `verifyToken.middleware.js` | Verifies the JWT stored in the `token` cookie |
| `cookie-parser.middleware.js` | Reads cookies from incoming requests |

## Requirements

- Node.js 18 or later
- MongoDB running locally or a reachable MongoDB instance

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=5001
DbURL=mongodb://localhost:27017/skillexchange
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-secure-password
```

Do not commit `.env` or real credentials to source control.

## Running the Server

Start the server with:

```bash
npm start
```

The API is available at `http://localhost:5001` by default. The server connects to MongoDB before it begins listening.

## Authentication

Successful student and admin logins set an HTTP-only `token` cookie. Send that cookie with protected requests. Logout clears the cookie.

### Student Login

```http
POST /students-api/students/login
Content-Type: application/json

{
	"email": "student@example.com",
	"password": "your-password"
}
```

### Admin Login

```http
POST /admin-api/login
Content-Type: application/json

{
	"username": "admin",
	"password": "your-admin-password"
}
```

## API Routes

### Student Routes

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/students-api/students` | No | Register a student |
| `POST` | `/students-api/students/login` | No | Log in a student |
| `POST` | `/students-api/students/logout` | No | Log out a student |
| `GET` | `/students-api/students/:id` | Student | View own profile |
| `PUT` | `/students-api/students/update/:id` | Student | Update own profile |
| `PUT` | `/students-api/students/update-password/:id` | Student | Update own password |
| `PUT` | `/students-api/students/:id/skills` | Student | Add a skill |
| `GET` | `/students-api/view-students/:id` | Student | View a student |
| `GET` | `/students-api/view-students` | Student | View all students |
| `GET` | `/students-api/students/skill/:skill` | Student | Find students by skill |
| `POST` | `/students-api/students/:id/requests` | Student | Create a help request |
| `PUT` | `/students-api/students/:id/requests/:requestId` | Student | Assign a request |
| `GET` | `/students-api/students/:id/requests` | Student | View the student's requests |
| `PUT` | `/students-api/students/:id/requests/:requestId/status` | Student | Accept or close a request |
| `GET` | `/students-api/students/:id/requests/status` | Student | View request statuses |
| `DELETE` | `/students-api/students/:id/requests/:requestId` | Student | Delete an own request |
| `DELETE` | `/students-api/students/:id` | Student | Delete own account |

### Admin Routes

All admin management routes require an admin JWT cookie.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/admin-api/login` | Log in an admin |
| `POST` | `/admin-api/logout` | Log out an admin |
| `GET` | `/admin-api/users` | List all students |
| `PUT` | `/admin-api/users/:id/activate` | Activate a student |
| `PUT` | `/admin-api/users/:id/deactivate` | Deactivate a student |
| `DELETE` | `/admin-api/users/:id` | Delete a student and their created requests |
| `GET` | `/admin-api/help-requests` | List all help requests |
| `GET` | `/admin-api/help-requests/:id` | View one help request |
| `PUT` | `/admin-api/help-requests/:id/moderate` | Update request `status` or `active` |
| `PUT` | `/admin-api/help-requests/:id/activate` | Activate a help request |
| `PUT` | `/admin-api/help-requests/:id/deactivate` | Deactivate a help request |
| `DELETE` | `/admin-api/help-requests/:id` | Delete a help request |

## Help Request Example

```http
POST /students-api/students/:id/requests
Content-Type: application/json

{
	"title": "Need help with JavaScript",
	"description": "I need help understanding asynchronous functions.",
	"skill": "JavaScript"
}
```

Valid request statuses are `Open`, `Accepted`, and `Closed`.

## Notes

- The API expects MongoDB to be available at the connection string in `DbURL`.
- Passwords are hashed during student registration.
- Protected requests require the `token` cookie created during login.
- The current project does not include automated tests; `npm test` is still the default placeholder script.
