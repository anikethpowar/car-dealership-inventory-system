You are helping build Phase 1 of a Car Dealership Inventory System.

Project root: ~/Incubyte
Backend root: ~/Incubyte/backend
Python virtual environment: ~/Incubyte/venv
Already installed packages include FastAPI, Uvicorn, SQLAlchemy, pydantic-settings, python-jose, pwdlib, pytest, httpx, and ruff.

Create only the backend application foundation. Do not build authentication, user models, vehicle models, Alembic migrations, frontend changes, or tests yet.

Create these files:

1. backend/app/core/config.py
- Use pydantic-settings.
- Read settings from a backend .env file when present.
- Include defaults for:
  - app_name = "Car Dealership Inventory System API"
  - app_version = "0.1.0"
  - database_url = SQLite database at backend/dealership.db
  - frontend_origin = "http://localhost:5173"
  - jwt_secret_key
  - jwt_algorithm = "HS256"
  - access_token_expire_minutes = 60
- Do not hardcode a real secret.

2. backend/app/db/database.py
- Create a SQLAlchemy SQLite engine using the configured database URL.
- Configure SQLite with check_same_thread=False.
- Create SessionLocal, a modern DeclarativeBase class named Base, and a get_db dependency generator.
- Include clear comments only where useful.

3. backend/app/main.py
- Create the FastAPI app using app name and version from settings.
- Add CORS middleware allowing only the configured frontend origin.
- Add GET /api/health.
- This endpoint must return exactly:
  {"status": "ok"}
- Add a simple database connection check using SELECT 1. If the database connection fails, return HTTP 503 with a useful detail message.
- Keep the API small and readable.

4. backend/.env.example
- Include safe example setting names and placeholder values only.
- Do not create or commit a real .env file.

5. Create any required __init__.py files in app/core and app/db.

Constraints:
- Do not change requirements.txt.
- Do not alter the frontend.
- Do not use an in-memory database.
- Do not create database tables yet.
- Do not make Git commits.
- Explain which files were created and give exact commands to run the API and verify /api/health.



You are helping build Phase 2 Part 1 of a Car Dealership Inventory System.

Project root: ~/Incubyte
Backend root: ~/Incubyte/backend

Existing backend foundation:
- app/core/config.py
- app/db/database.py
- SQLAlchemy Base already exists in app.db.database
- SQLite is already configured
- No database tables or Alembic migrations exist yet.

Task: create only the SQLAlchemy data models. Do not create API routes, authentication endpoints, Pydantic schemas, Alembic migrations, frontend changes, tests, or Git commits.

Create these files:

1. backend/app/models/user.py
Create a User SQLAlchemy model using modern SQLAlchemy 2 type annotations.

Table name: users

Fields:
- id: integer primary key
- email: string, required, unique, indexed
- password_hash: string, required
- role: string, required, default "customer"
- created_at: timezone-aware datetime, required, server default current timestamp
- updated_at: timezone-aware datetime, required, server default current timestamp and updated automatically when the row changes

Use a CheckConstraint so role can only be "customer" or "admin".

2. backend/app/models/vehicle.py
Create a Vehicle SQLAlchemy model using modern SQLAlchemy 2 type annotations.

Table name: vehicles

Fields:
- id: integer primary key
- make: string, required, indexed
- model: string, required, indexed
- category: string, required, indexed
- price: Numeric decimal with 10 total digits and 2 decimal places, required
- quantity: integer, required, default 0
- created_at: timezone-aware datetime, required, server default current timestamp
- updated_at: timezone-aware datetime, required, server default current timestamp and updated automatically when the row changes

Use database CheckConstraints:
- price must be greater than 0
- quantity must be greater than or equal to 0

3. backend/app/models/__init__.py
Import and expose both User and Vehicle so Alembic can discover their metadata later.

Constraints:
- Use app.db.database.Base.
- Do not call Base.metadata.create_all.
- Do not create an in-memory database.
- Do not add relationships because users and vehicles do not need one for this kata.
- Use readable names and minimal helpful comments.
- Do not modify existing database configuration.
- Do not make Git commits.

After completing the files, explain what was created and give commands to verify imports and run Ruff.



You are helping build Phase 2 Part 2 of a Car Dealership Inventory System.

Project root: ~/Incubyte
Backend root: ~/Incubyte/backend

Current backend:
- SQLAlchemy Base is in app.db.database
- User and Vehicle SQLAlchemy models exist in app.models
- SQLite database configuration exists in app.core.config
- No Alembic setup currently exists.

Task: configure Alembic so it can create migrations from the existing User and Vehicle models.

Requirements:
1. Initialize Alembic inside the backend directory if it is not already initialized.
   Expected output locations:
   - backend/alembic.ini
   - backend/alembic/
   - backend/alembic/versions/

2. Configure backend/alembic/env.py so that:
   - It imports settings from app.core.config.
   - It imports Base from app.db.database.
   - It imports app.models so User and Vehicle are registered in Base.metadata.
   - target_metadata is Base.metadata.
   - It uses settings.database_url instead of a hardcoded URL.

3. Do not create or run a migration revision yet.
4. Do not modify the SQLAlchemy models, FastAPI routes, frontend, or requirements.txt.
5. Do not make a Git commit.
6. Keep standard Alembic offline and online migration behavior working.

After completing the configuration, state the exact command to generate the first automatic migration and the exact command to apply it.


You are helping build Phase 3 Part 1 of a Car Dealership Inventory System using test-driven development.

Project root: ~/Incubyte
Backend root: ~/Incubyte/backend

Existing backend:
- FastAPI application exists in app.main.
- SQLAlchemy Base and get_db dependency exist in app.db.database.
- User model exists in app.models.user.
- Vehicle model exists in app.models.vehicle.
- SQLite and Alembic are configured.
- No authentication routes, schemas, services, or tests exist yet.

Task: create ONLY the failing tests for customer registration. Do not implement any production authentication code.

Create:

1. backend/tests/conftest.py
- Create a pytest fixture named client.
- Use FastAPI TestClient.
- Use a temporary file-based SQLite database created through pytest tmp_path. Do not use an in-memory database.
- Create and drop all SQLAlchemy tables around each test using Base.metadata.
- Override the FastAPI get_db dependency so tests use the temporary database, never backend/dealership.db.
- Clear app.dependency_overrides after each test.

2. backend/tests/test_auth_registration.py
Create these tests:

A. test_register_customer_success
- Send POST request to /api/auth/register.
- JSON request body:
  {
    "email": "customer@example.com",
    "password": "SecurePass123!"
  }
- Expect HTTP 201.
- Assert returned JSON contains:
  - an integer id
  - email equal to customer@example.com
  - role equal to customer
- Assert password and password_hash are never returned.

B. test_register_duplicate_email_is_rejected
- Register customer@example.com once.
- Register the same email again.
- Expect HTTP 409.
- Expect JSON detail exactly:
  "Email is already registered"

Constraints:
- Do not create app/api routes, schemas, services, security functions, or authentication implementation.
- Do not modify models, migrations, database configuration, frontend, or requirements.txt.
- Do not make Git commits.
- The tests are expected to fail with 404 because the registration endpoint does not exist yet.
- Keep test code clear and beginner-friendly.

After creating the files, state the exact pytest command to run the tests.