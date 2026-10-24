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

You are helping build Phase 3 Part 2 of a Car Dealership Inventory System.

Project root: ~/Incubyte
Backend root: ~/Incubyte/backend

TDD status:
- backend/tests/test_auth_registration.py already exists.
- It contains two failing tests for POST /api/auth/register.
- Do not modify those tests.
- The required behavior is:
  1. Register customer@example.com with SecurePass123! returns HTTP 201.
  2. Response includes id, email, and role="customer".
  3. Response never includes password or password_hash.
  4. Registering the same email again returns HTTP 409 with:
     {"detail": "Email is already registered"}

Task: implement only customer registration so the existing tests pass.

Create:

1. backend/app/schemas/auth.py
- Registration request schema:
  - email must use EmailStr.
  - password must have a minimum length of 8.
- Safe user response schema:
  - id: int
  - email: EmailStr
  - role: str
- Configure Pydantic v2 from_attributes support.

2. backend/app/core/security.py
- Use pwdlib PasswordHash.recommended().
- Create a hash_password(password: str) -> str function.
- Never log or return plain-text passwords.

3. backend/app/services/auth_service.py
- Create a small function that registers a customer.
- Check whether the email already exists.
- Store a password hash, not the plain password.
- Store the default role as customer.
- Raise an appropriate error or return a clear result that lets the route produce the required HTTP 409 response.

4. backend/app/api/routes/auth.py
- Create an APIRouter with prefix /api/auth and tag Auth.
- Create POST /register.
- Use the existing get_db dependency.
- Return HTTP 201 for successful registration.
- Return the safe user response schema only.
- For duplicate email, return HTTP 409 with exact detail:
  "Email is already registered"

5. Update backend/app/main.py only as needed to include the auth router.

Constraints:
- Do not modify existing tests.
- Do not implement login, JWT token generation, protected endpoints, admin roles, vehicles, frontend changes, or Alembic migrations yet.
- Do not change database models.
- Do not make Git commits.
- Keep code beginner-friendly, type annotated, and clean.

After implementation, state the exact commands to run the registration tests and Ruff.


You are working in the existing FastAPI backend for a car dealership inventory system.

Task: Phase 3, Part 3 — write tests that specify login behavior only. This is the RED step of TDD. Do not implement login code yet.

Read the existing project structure and reuse the current pytest fixtures in backend/tests/conftest.py and the registration endpoint at POST /api/auth/register.

Create exactly one test file:
backend/tests/test_auth_login.py

Test 1: test_login_with_valid_credentials_returns_access_token
- Register a customer first through POST /api/auth/register using:
  email: customer@example.com
  password: SecurePass123!
- Send POST /api/auth/login as JSON with the same email and password.
- Expect HTTP 200.
- Assert the response JSON contains:
  - access_token: a non-empty string
  - token_type: exactly "bearer"
- Assert the response does not contain password or password_hash.

Test 2: test_login_with_invalid_password_is_rejected
- Register the same customer first.
- Send POST /api/auth/login as JSON using:
  email: customer@example.com
  password: WrongPass123!
- Expect HTTP 401.
- Assert the JSON detail is exactly:
  "Incorrect email or password"

Test 3: test_login_with_unknown_email_is_rejected
- Do not register a user.
- Send POST /api/auth/login as JSON using:
  email: unknown@example.com
  password: SecurePass123!
- Expect HTTP 401.
- Assert the JSON detail is exactly:
  "Incorrect email or password"

Constraints:
- Do not change any production application code.
- Do not change existing tests, migrations, database models, requirements, or frontend files.
- Do not create a login route, JWT utility, schemas, services, or seed data yet.
- Keep the tests concise, typed, readable, and compatible with ruff.
- Do not run git commands and do not create commits.


You are working in the existing FastAPI backend for a car dealership inventory system.

Task: Phase 3, Part 4 — implement customer login and JWT access-token creation only, so the existing login tests pass.

First inspect the existing project. Keep the current registration behavior working and preserve its routes, database setup, models, and test fixture design.

Implement the following:

1. Configuration
- Update backend/app/core/config.py and backend/.env.example as necessary.
- Add settings for:
  - SECRET_KEY
  - ALGORITHM, with default value "HS256"
  - ACCESS_TOKEN_EXPIRE_MINUTES, with a sensible default such as 30
- SECRET_KEY must come from the environment in real use. The .env.example must contain a clearly fake development placeholder, never a real secret.
- Preserve existing settings and naming conventions.

2. Security utilities
- Update backend/app/core/security.py.
- Keep the existing password hashing function unchanged in behavior.
- Add a function to verify a plain password against its stored hash using pwdlib.
- Add a function that creates a signed JWT access token using python-jose.
- The token must include:
  - "sub": the user id as a string
  - "role": the user role
  - "exp": an expiry timestamp based on ACCESS_TOKEN_EXPIRE_MINUTES
- Do not log tokens, secrets, passwords, or password hashes.

3. Request and response schemas
- Update backend/app/schemas/auth.py.
- Add a login request schema containing:
  - email: EmailStr
  - password: string with minimum length 8
- Add an access-token response schema containing:
  - access_token: str
  - token_type: str

4. Authentication service
- Update or extend backend/app/services/auth_service.py.
- Add a login function that:
  - looks up the user by email;
  - verifies the supplied password against password_hash;
  - returns a JWT access token on success;
  - raises HTTPException with status 401 and exactly this detail for either unknown email or invalid password:
    "Incorrect email or password"
- Do not reveal whether an email exists.
- Do not return User ORM objects, hashes, or passwords.

5. Route
- Update backend/app/api/routes/auth.py.
- Add POST /api/auth/login.
- It must accept JSON matching the login request schema.
- It must return HTTP 200 JSON matching the token response schema:
  {
    "access_token": "<non-empty JWT string>",
    "token_type": "bearer"
  }

Constraints:
- Do not change existing test files.
- Do not modify database models or Alembic migrations.
- Do not add protected-route logic, role checks, vehicle endpoints, frontend work, or admin seed data yet.
- Do not run git commands or create a commit.
- Keep formatting compatible with ruff.

When complete, report the files changed and any commands I should run.

You are working in the existing FastAPI backend for a car dealership inventory system.

Task: Phase 3, Part 5A — write tests that specify JWT-protected identity and admin role behavior only. This is the RED step of TDD. Do not implement production authorization code yet.

First inspect the existing project, especially:
- backend/tests/conftest.py
- backend/app/models/user.py
- backend/app/core/security.py
- existing registration and login tests

Create exactly one test file:
backend/tests/test_auth_authorization.py

Write these tests:

1. test_me_requires_authentication
- Send GET /api/auth/me without an Authorization header.
- Expect HTTP 401.
- Do not require an exact error-detail string because FastAPI may provide the standard authentication message.

2. test_me_rejects_invalid_bearer_token
- Send GET /api/auth/me with this header:
  Authorization: Bearer invalid-token
- Expect HTTP 401.
- Assert the JSON contains a non-empty "detail" field.

3. test_me_returns_current_authenticated_customer
- Register a customer through POST /api/auth/register:
  email: customer@example.com
  password: SecurePass123!
- Log in through POST /api/auth/login with the same credentials.
- Read access_token from the successful response.
- Send GET /api/auth/me with:
  Authorization: Bearer <access_token>
- Expect HTTP 200.
- Assert the response contains:
  - id as an integer
  - email exactly "customer@example.com"
  - role exactly "customer"
- Assert the response does not contain password or password_hash.

4. test_admin_route_rejects_customer
- Register and log in a normal customer as above.
- Send GET /api/admin/me with that customer’s bearer token.
- Expect HTTP 403.
- Assert the JSON detail is exactly:
  "Admin access required"

5. test_admin_route_allows_admin
- Create a real database user with:
  - email: admin@example.com
  - a securely hashed password
  - role: admin
- Use the existing temporary test database and its fixture conventions; do not use the production dealership.db file.
- Log in with that admin’s email and password through POST /api/auth/login.
- Send GET /api/admin/me with the returned bearer token.
- Expect HTTP 200.
- Assert the response contains:
  - email exactly "admin@example.com"
  - role exactly "admin"
- Assert there is no password or password_hash in the response.

Constraints:
- Do not modify any production application code.
- Do not change existing test files, models, migrations, requirements, or frontend files.
- Do not create protected dependencies, routes, seed scripts, or admin setup yet.
- Do not run Git commands and do not create commits.
- Keep tests readable, typed, and Ruff-compatible.

You are working in the existing FastAPI backend for a car dealership inventory system.

Task: Phase 3, Part 5B — implement reusable JWT authentication and admin-role authorization so all existing tests pass.

First inspect:
- backend/tests/test_auth_authorization.py
- backend/app/core/config.py
- backend/app/core/security.py
- backend/app/db/database.py
- backend/app/models/user.py
- backend/app/api/routes/auth.py
- backend/app/main.py

Implement the following production code only:

1. Current-user dependency
- Create backend/app/api/deps.py.
- Use FastAPI HTTPBearer security to read the Authorization: Bearer <token> header.
- Create a reusable get_current_user dependency that:
  - decodes the JWT using the configured SECRET_KEY and ALGORITHM;
  - validates that "sub" is a valid integer user id;
  - loads that user from the database;
  - returns the current User ORM object;
  - rejects missing, malformed, expired, invalid, or unknown-user tokens with HTTP 401;
  - uses a safe generic detail such as "Could not validate credentials";
  - sets a Bearer authentication challenge header where appropriate.
- Never trust the JWT role claim alone for authorization. Load the user from the database, then use that database role.

2. Admin dependency
- In the same deps.py, create a reusable require_admin dependency.
- It must depend on get_current_user.
- It must return the user only if user.role is exactly "admin".
- Otherwise raise HTTP 403 with exactly:
  "Admin access required"

3. Safe user response
- Reuse the existing safe public user-response schema if it already fits.
- If needed, add a response schema in backend/app/schemas/auth.py containing only id, email, and role, with Pydantic v2 from_attributes enabled.
- Never expose password or password_hash.

4. Authenticated identity route
- Update backend/app/api/routes/auth.py.
- Add GET /api/auth/me.
- It must use get_current_user.
- Return the safe authenticated-user response with HTTP 200.

5. Admin identity route
- Create backend/app/api/routes/admin.py.
- Its router prefix must be /api/admin and it should have an appropriate "Admin" tag.
- Add GET /api/admin/me.
- It must use require_admin.
- Return the safe authenticated-user response with HTTP 200.

6. App wiring
- Update backend/app/main.py only as needed to include the admin router.
- Preserve all existing route behavior.

Constraints:
- Do not modify any test files.
- Do not change database models, Alembic migrations, requirements, frontend files, or the JWT login behavior.
- Do not create an admin seed script yet; the existing test creates its own temporary admin record.
- Do not run Git commands or create a commit.
- Keep code typed, concise, secure, and Ruff-compatible.

When complete, report the files changed and commands I should run.



You are working in the existing FastAPI backend for a car dealership inventory system.

Task: finish Phase 3 by adding a safe, repeatable development admin-account seed command.

First inspect the existing settings, database session setup, User model, password hashing utility, .env.example, and package structure.

Implement:

1. Create a runnable seed command under backend/scripts/ so it can be executed from the backend directory as:
   python -m scripts.seed_admin

2. The command must:
   - create one user with role "admin";
   - get its email and password from environment variables named ADMIN_EMAIL and ADMIN_PASSWORD;
   - use reasonable clearly-development-only fallback values if those variables are absent:
     email: admin@example.com
     password: AdminPass123!
   - hash the password using the project’s existing hash_password utility;
   - use the existing database configuration and SQLAlchemy session setup;
   - be idempotent:
     - if no user with ADMIN_EMAIL exists, create the admin and print a concise success message;
     - if a user with that email already exists and is admin, print that it already exists and exit successfully;
     - if a user with that email exists but is not admin, do not silently change its role; print a clear message and exit with a non-zero status or clear failure.
   - never print the password, password hash, JWT, database URL, or secret key.

3. Update backend/.env.example:
   - document ADMIN_EMAIL and ADMIN_PASSWORD;
   - keep all example secrets clearly fake/development-only;
   - do not add a real secret.

4. Add backend/scripts/__init__.py if needed.

Constraints:
- Do not modify tests, routes, authentication dependencies, database models, migrations, requirements, or frontend files.
- Do not add startup-time automatic seeding.
- Do not run Git commands or create commits.
- Keep the script typed, concise, and Ruff-compatible.

When complete, report changed files and the exact command I should run to create the demonstration admin.

You are working in the existing FastAPI backend for a car dealership inventory system.

Task: finish Phase 3 by adding a safe, repeatable development admin-account seed command.

First inspect the existing settings, database session setup, User model, password hashing utility, .env.example, and package structure.

Implement:

1. Create a runnable seed command under backend/scripts/ so it can be executed from the backend directory as:
   python -m scripts.seed_admin

2. The command must:
   - create one user with role "admin";
   - get its email and password from environment variables named ADMIN_EMAIL and ADMIN_PASSWORD;
   - use reasonable clearly-development-only fallback values if those variables are absent:
     email: admin@example.com
     password: AdminPass123!
   - hash the password using the project’s existing hash_password utility;
   - use the existing database configuration and SQLAlchemy session setup;
   - be idempotent:
     - if no user with ADMIN_EMAIL exists, create the admin and print a concise success message;
     - if a user with that email already exists and is admin, print that it already exists and exit successfully;
     - if a user with that email exists but is not admin, do not silently change its role; print a clear message and exit with a non-zero status or clear failure.
   - never print the password, password hash, JWT, database URL, or secret key.

3. Update backend/.env.example:
   - document ADMIN_EMAIL and ADMIN_PASSWORD;
   - keep all example secrets clearly fake/development-only;
   - do not add a real secret.

4. Add backend/scripts/__init__.py if needed.

Constraints:
- Do not modify tests, routes, authentication dependencies, database models, migrations, requirements, or frontend files.
- Do not add startup-time automatic seeding.
- Do not run Git commands or create commits.
- Keep the script typed, concise, and Ruff-compatible.

When complete, report changed files and the exact command I should run to create the demonstration admin.

You are working in an existing FastAPI backend for a car dealership inventory system.

Task: Phase 4 — build the complete vehicle inventory API with tests, authorization, stock management, filtering, and search.

First inspect the existing project carefully. In particular, inspect:
- backend/app/models/vehicle.py
- backend/app/models/user.py
- backend/app/api/deps.py
- backend/app/api/routes/auth.py
- backend/app/api/routes/admin.py
- backend/app/core/security.py
- backend/app/db/database.py
- backend/app/main.py
- backend/tests/conftest.py
- backend/tests/test_auth_authorization.py

Important project facts:
- Authentication already uses JWT bearer tokens.
- get_current_user is the reusable authenticated-user dependency.
- require_admin is the reusable admin-only dependency.
- The existing Vehicle SQLAlchemy model and migration already define the database fields. Reuse them. Do not change database models or create a new Alembic migration unless it is genuinely impossible to meet the requirements otherwise.
- Existing tests must continue to pass.
- The test database must remain the temporary file-based SQLite database provided by existing fixtures. Never use the production dealership.db file in tests.

Goal:
Implement a production-quality vehicle API with this behavior.

==================================================
A. API ROUTES AND AUTHORIZATION
==================================================

Create backend/app/api/routes/vehicles.py and wire its router into backend/app/main.py with the prefix:

/api/vehicles

Use the tag "Vehicles".

Implement these routes:

1. POST /api/vehicles
- Admin only: use require_admin.
- Create a vehicle.
- Return HTTP 201 and the safe vehicle response.
- Customer token must receive HTTP 403 with:
  {"detail": "Admin access required"}

2. GET /api/vehicles
- Public read endpoint; no token should be required.
- Return a paginated vehicle list.
- Support these optional query parameters:
  - make: exact match, case-insensitive
  - model: exact match, case-insensitive
  - category: exact match, case-insensitive
  - min_price: decimal value, inclusive
  - max_price: decimal value, inclusive
  - in_stock: boolean; when true, only quantity > 0
  - page: integer, default 1, minimum 1
  - page_size: integer, default 10, minimum 1, maximum 100
- Return vehicles in a deterministic order, newest id first.
- Return this paginated shape:
  {
    "items": [vehicle, ...],
    "total": integer,
    "page": integer,
    "page_size": integer
  }

3. GET /api/vehicles/search
- Public read endpoint; no token required.
- Require query parameter q with at least one non-whitespace character.
- Search case-insensitively across make, model, and category.
- Return the same paginated shape as GET /api/vehicles.
- Support page and page_size as above.
- Put this route before any dynamic /{vehicle_id} route so it is never treated as an id.

4. GET /api/vehicles/{vehicle_id}
- Public read endpoint; no token required.
- Return one vehicle.
- If no vehicle exists, return HTTP 404 with exactly:
  {"detail": "Vehicle not found"}

5. PUT /api/vehicles/{vehicle_id}
- Admin only.
- Support partial updates for make, model, category, price, and quantity.
- Reject empty request bodies through schema validation or a clear HTTP 422 validation response.
- Return the updated vehicle.
- Missing vehicle must return the same exact 404 response above.

6. DELETE /api/vehicles/{vehicle_id}
- Admin only.
- Delete the vehicle.
- Return HTTP 204 with no response body.
- Missing vehicle must return the same exact 404 response above.

7. POST /api/vehicles/{vehicle_id}/purchase
- Requires a valid logged-in user through get_current_user. Both customer and admin tokens may use it.
- No request body is required; a purchase means buying exactly one unit.
- If the vehicle does not exist, return the same exact 404 response above.
- If quantity is 0, return HTTP 400 with exactly:
  {"detail": "Vehicle is out of stock"}
- Otherwise reduce quantity by exactly 1 and return the updated vehicle with HTTP 200.
- Quantity must never become negative.

8. POST /api/vehicles/{vehicle_id}/restock
- Admin only.
- Accept JSON:
  {"quantity": positive integer}
- Add that quantity to the current stock.
- Quantity must be strictly greater than 0; invalid values must produce HTTP 422 validation errors.
- Return the updated vehicle.
- Missing vehicle must return the same exact 404 response above.

==================================================
B. SCHEMAS, VALIDATION, AND DATA SAFETY
==================================================

Create or update vehicle schemas in backend/app/schemas/vehicle.py and export them appropriately.

Use separate schemas where they make the API clear:
- VehicleCreate
- VehicleUpdate
- VehicleResponse
- VehicleListResponse
- RestockRequest

Validation requirements:
- make, model, and category must be stripped strings with at least one visible character.
- price must be a positive decimal value greater than 0.
- quantity must be a whole number greater than or equal to 0 for creation and updates.
- restock quantity must be a whole number greater than 0.
- Keep decimal handling accurate: do not convert money into floats for database operations.
- VehicleResponse must use Pydantic v2 from_attributes configuration.
- Do not expose SQLAlchemy internals or unrelated fields.

Use the existing Vehicle model’s fields. If it includes timestamps, it is acceptable to expose them in the response, but do not require clients to submit them.

==================================================
C. SERVICE LAYER
==================================================

Create backend/app/services/vehicle_service.py.

Keep route handlers thin. Put database-query and mutation logic in the service layer, including:
- finding a vehicle or raising the exact 404;
- creating, updating, and deleting;
- listing/filtering/pagination;
- text searching;
- purchasing;
- restocking.

Use SQLAlchemy 2-style queries consistently with the rest of the project.
Commit database changes safely and refresh entities before returning them.

For case-insensitive filtering and searching, use SQLite-compatible SQLAlchemy expressions.

==================================================
D. TESTS — REQUIRED TDD COVERAGE
==================================================

Create a new test module:

backend/tests/test_vehicle_inventory.py

Do not modify existing test files except if a tiny shared helper is genuinely necessary. Prefer helpers inside this new module.

The tests must create users through normal registration/login flows where possible. For creating an admin test user, follow the established test-database technique from test_auth_authorization.py. Never depend on the local production database or the seed script.

Add clear, focused tests covering at least all of the following:

1. An admin can create a valid vehicle and receives HTTP 201.
2. A customer cannot create a vehicle and receives HTTP 403 with the exact admin detail.
3. A public caller can list vehicles without a token.
4. List filtering works for make, category, minimum price, maximum price, and in_stock.
5. Pagination returns the expected items, total, page, and page_size.
6. Public text search finds matching make, model, or category, case-insensitively.
7. Public GET by id returns a vehicle; an unknown id returns the exact 404 detail.
8. An admin can partially update a vehicle.
9. A customer cannot update or delete a vehicle.
10. An admin can delete a vehicle and receives HTTP 204; requesting it afterward returns 404.
11. An authenticated customer can purchase an in-stock vehicle and stock decreases by exactly one.
12. Purchase without a bearer token is rejected with HTTP 401.
13. Purchasing an out-of-stock vehicle returns HTTP 400 with the exact out-of-stock detail and never makes quantity negative.
14. An admin can restock a vehicle and stock increases correctly.
15. A customer cannot restock a vehicle and receives HTTP 403.
16. Invalid vehicle values are rejected, including zero/negative price, negative quantity, blank text fields, and a restock quantity of zero.

Tests must remain concise, deterministic, typed where appropriate, and Ruff-compatible.

==================================================
E. CONSTRAINTS
==================================================

- Preserve all existing registration, login, JWT, /api/auth/me, /api/admin/me, and seed-admin behavior.
- Do not change existing User or Vehicle database models unless absolutely required.
- Do not create a frontend.
- Do not add payment processing, order tables, reservations, image uploads, or any feature outside this phase.
- Do not alter requirements unless a missing package is absolutely necessary; this phase should work with the existing dependencies.
- Do not run Git commands and do not create commits.
- Run the tests and Ruff when finished.
- If a design detail is unclear, choose the smallest secure implementation consistent with these requirements.

When complete, report:
1. every changed or created file;
2. the test and Ruff commands run;
3. the outcome of those commands;
4. any deliberate small design decisions.