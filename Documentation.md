
# Technical Documentation — StudentCourseAPI

This document provides a technical overview of the project, how to run it locally, the architecture, API reference (endpoints), testing, Swagger documentation, and CI suggestions.

## Table of contents
- Introduction
- Quick start
- Project structure
- Architecture & components
- API endpoints (reference)
- Data model and storage
- Testing
- Swagger / API documentation
- Continuous Integration (CI)
- Contributing & PR checklist
- Troubleshooting

## Introduction

Key features:
- CRUD for students and courses
- Enrollment endpoints (students ↔ courses)
- In-memory storage service with seed/reset helpers
- API documentation via JSDoc-style Swagger comments (swagger-jsdoc + swagger-ui-express)

## Quick start

Prerequisites:
- Node.js (v23.10.0)
- npm

Install and run locally:

```bash
npm install
npm run dev      # starts with nodemon
```

Open the API docs in your browser: http://localhost:3000/api-docs

Run tests:

```bash
npm test
```

Run lint/format:

```bash
npm run lint
npm run format
```

## Project structure

Top-level layout (relevant files/folders):

- `src/`
	- `app.js` — Express app bootstrap, middleware and Swagger setup
	- `controllers/` — route handlers with Swagger JSDoc comments
		- `coursesController.js`
		- `studentsController.js`
	- `routes/` — express routers mounted by `app.js`
		- `courses.js`
		- `students.js`
	- `services/storage.js` — in-memory storage and business logic (seed/reset, CRUD, enroll/unenroll)
- `tests/` — Jest tests
	- `integration/` — integration tests exercising the app through HTTP
	- `unit/` — unit tests for services
- `.github/` — CI workflows and PR template
- `package.json` — scripts and dependencies
- `swagger.json` — (optional) static swagger specification (disabled by default)

## Architecture & components

- Express app (`src/app.js`) configures JSON body parsing, swagger UI (`/api-docs`) and mounts routers:
	- `/students` → `src/routes/students.js`
	- `/courses` → `src/routes/courses.js`
- Controllers implement endpoint logic and call `services/storage.js` for data access.
- `storage.js` keeps data in-memory (arrays of objects) and exposes helpers:
	- seed(), reset(), list(), get(), create(), remove(), enroll(), unenroll(), getCourseStudents()

## API endpoints (reference)

All endpoints return JSON and use conventional HTTP status codes.

Students
- GET /students — list students (supports pagination via query params)
- GET /students/:id — get a student by id
- POST /students — create a student (body: { name, email }) — 201
- PUT /students/:id — update a student
- DELETE /students/:id — delete student (204)

Courses
- GET /courses — list courses (query filters: title, teacher, page, limit)
- GET /courses/:id — get a course and its enrolled students
- POST /courses — create a course (body: { title, teacher }) — 201
- PUT /courses/:id — update a course
- DELETE /courses/:id — delete a course (204)

CourseStudent (Enrollment)
- POST /courses/:courseId/students/:studentId — enroll a student in a course — 201
- DELETE /courses/:courseId/students/:studentId — unenroll — 204

Notes
- The routes are made such that the full path for enrolling is `/courses/{courseId}/students/{studentId}`

## Data model and storage

The project uses an in-memory store. Example of data stored :

- Student:
	- id: integer
	- name: string
	- email: string

- Course:
	- id: integer
	- title: string
	- teacher: string

Enrollments are stored as relationships inside the storage service and returned when requesting a course's students.

## Testing

- Unit tests: `tests/unit`
- Integration tests: `tests/integration`

Run all tests:

```bash
npm test
```

Coverage
- The project includes `coverage/` output when tests are run with coverage enabled. To enable coverage in CI, run jest with `--coverage` or `npm test -- --coverage`.

Note
- Tests call `storage.reset()` and `storage.seed()` in `beforeEach` to ensure a clean state, as the data is stored locally and reseted between each re-starts

## Swagger / API documentation

- The project uses `swagger-jsdoc` to generate an OpenAPI spec from JSDoc comments in `src/controllers/*.js` and `swagger-ui-express` to serve it at `/api-docs`.
- To ensure controller comments are included, the `app.js` file creates `swaggerSpec = swaggerJSDoc(options)` and serves it:

	- `options.apis` is set to scan `./src/controllers/*.js`.

The app used to have a generic `swagger.json` file, but we prefered to use direct commenting above routes as it provides easier access to documentation when debuging and re-working on the controllers.  

## Continuous Integration (CI)
(in .github/workflows/ci.yml)

The CI does :
- Makes sure Node v23 is used
- Install dependencies (`npm ci`)
- Run ESLint (`npm run lint`)
- Format check (`npx prettier --check`)
- Run tests with coverage (`npm test -- --coverage`)

## PR template

I opted for a light PR template
It just consists in a template for the title being used, and is not constraining.

It means any PR description is light and easy to get at first glance, tho additional informations can be added to the corresponding area.

> \[type]: [message]
- *type* corresponds to a type of PR to chose from the list in the corresponding section.
- *message* a short description of the PR content

## Troubleshooting

- Route not found in tests:
	- Verify the full route including mounts (e.g., use `/courses/1/students/1`, not `/1/students/1`).