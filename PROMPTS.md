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


You are working in the existing FastAPI backend for a car dealership inventory system.

Task: make the existing vehicle purchase operation safe against concurrent purchases.

First inspect:
- backend/app/services/vehicle_service.py
- backend/app/api/routes/vehicles.py
- backend/tests/test_vehicle_inventory.py
- the existing Vehicle SQLAlchemy model

Problem:
The current purchase_vehicle implementation does a read-check-decrement-commit sequence. Two simultaneous purchase requests could both see quantity 1 before either commits. Replace that implementation with an atomic database update.

Required behavior:
- Update only purchase_vehicle in backend/app/services/vehicle_service.py, plus narrowly related tests if truly needed.
- Use one SQLAlchemy conditional UPDATE statement that reduces quantity by exactly 1 only where:
  - Vehicle.id equals vehicle_id; and
  - Vehicle.quantity is greater than 0.
- The decrement must be performed by the database expression itself, not by reading quantity and subtracting in Python.
- If the conditional update affects one row:
  - commit the transaction;
  - load and return the updated Vehicle.
- If it affects zero rows:
  - determine whether the vehicle does not exist:
    - then raise HTTP 404 with exactly "Vehicle not found";
  - otherwise it exists but stock is zero:
    - raise HTTP 400 with exactly "Vehicle is out of stock".
- If any database error occurs during the write, roll back the session before re-raising.
- Preserve all route paths, response shapes, authorization behavior, and existing API behavior.
- Do not modify models, migrations, frontend files, authentication code, or unrelated services.
- Do not run Git commands or create a commit.
- Keep the code typed and Ruff-compatible.

Add or improve a focused test only if it materially verifies a missing purchase edge case. Keep all existing tests passing.

When complete, report changed files and commands I should run.

You are working in the existing React/Vite frontend for a car dealership inventory system.

Task: Phase 6 — replace the Vite starter page with a clean, responsive frontend application shell that has routing, an Axios API client, and session-based authentication state.

First inspect:
- frontend/package.json
- frontend/vite.config.js
- frontend/src/
- frontend/src/index.css
- frontend/.gitignore
- backend API routes and response shapes, especially:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me
  - GET /api/admin/me

The frontend uses JavaScript and JSX, not TypeScript. Preserve that choice.

==================================================
A. DEPENDENCIES AND ENVIRONMENT
==================================================

1. Install only these missing frontend dependencies if they are not already present:
- axios
- react-router-dom

2. Create frontend/.env.example containing:
VITE_API_BASE_URL=http://127.0.0.1:8000

3. The API client must read the base URL from:
import.meta.env.VITE_API_BASE_URL

A development fallback of http://127.0.0.1:8000 is acceptable, but environment configuration must take priority.

4. Do not place passwords, JWTs, or real secrets in any frontend environment file.

==================================================
B. REQUIRED FOLDER STRUCTURE
==================================================

Create a clear, reusable structure under frontend/src/:

- api/
  - client.js
  - auth.js
- auth/
  - AuthContext.jsx
  - ProtectedRoute.jsx
  - AdminRoute.jsx
- components/
  - AppLayout.jsx
  - Header.jsx
  - LoadingScreen.jsx
  - MessageAlert.jsx
- pages/
  - DashboardPage.jsx
  - LoginPage.jsx
  - RegisterPage.jsx
  - AdminInventoryPage.jsx
  - NotFoundPage.jsx
- App.jsx
- main.jsx

You may add small supporting files only when they make the structure cleaner.

==================================================
C. AXIOS API CLIENT
==================================================

Create frontend/src/api/client.js.

Requirements:
- Create one configured Axios instance.
- Set its baseURL from VITE_API_BASE_URL.
- Set JSON content headers.
- Use a request interceptor to add:
  Authorization: Bearer <token>
  only when a session token exists.
- Do not hardcode a token.
- Do not log tokens, passwords, or API credentials to the browser console.
- Make token access reusable without creating circular imports.

Create frontend/src/api/auth.js with small functions for:
- register(payload)
- login(payload)
- getCurrentUser()

Use the backend’s existing JSON request/response shapes.

==================================================
D. AUTHENTICATION CONTEXT
==================================================

Create frontend/src/auth/AuthContext.jsx.

Requirements:
- Provide an AuthProvider and a reusable useAuth hook.
- Keep these values in context:
  - user: null or safe user data from GET /api/auth/me
  - token: null or JWT string
  - isAuthenticated: boolean
  - isAdmin: boolean derived from user.role === "admin"
  - isLoading: boolean while restoring an existing session
  - login(credentials)
  - register(payload)
  - logout()
- Store the JWT only in sessionStorage, not localStorage. Use a clear key such as dealership_access_token.
- On app startup:
  - read a token from sessionStorage;
  - if it exists, call GET /api/auth/me;
  - retain the token only if that request succeeds;
  - if it fails, clear the invalid token and unauthenticated state.
- During login:
  - call POST /api/auth/login;
  - store access_token in sessionStorage;
  - call GET /api/auth/me to retrieve the trusted id, email, and role;
  - update context state.
- During register:
  - call POST /api/auth/register;
  - do not automatically invent admin privileges;
  - it is acceptable to return the registration result so RegisterPage can direct the user to login.
- logout must clear sessionStorage and all authentication state.
- Use clear error propagation so forms can display backend errors.
- Do not decode or trust the JWT role claim in the browser. Use GET /api/auth/me as the trusted role source.

==================================================
E. ROUTING AND ACCESS CONTROL
==================================================

Use react-router-dom and configure these routes:

Public:
- /login → LoginPage
- /register → RegisterPage

Authenticated:
- / → DashboardPage

Admin only:
- /admin/inventory → AdminInventoryPage

Fallback:
- * → NotFoundPage

Create:
- ProtectedRoute: redirects unauthenticated visitors to /login.
- AdminRoute: redirects unauthenticated visitors to /login and non-admin users to /.

While authentication state is initially restoring, show LoadingScreen instead of redirecting prematurely.

==================================================
F. PAGES AND CURRENT-SCOPE UI
==================================================

1. LoginPage
- Email and password form.
- Submit through useAuth().login.
- Display backend/API errors accessibly.
- On successful login:
  - redirect admins to /admin/inventory;
  - redirect customers to /.
- Link to /register.
- Do not display passwords after entry.

2. RegisterPage
- Email, password, and confirm-password fields.
- Client-side check that passwords match.
- Submit through useAuth().register.
- Display backend/API errors accessibly.
- On success, show a clear success message and redirect or link to /login.
- Never let the form choose a role.

3. DashboardPage
- Authenticated customer dashboard shell.
- Show a friendly welcome using the user email.
- Include a clear “Vehicle inventory is coming next” placeholder.
- If the current user is admin, show a navigation link to /admin/inventory.
- Do not build vehicle browsing, purchasing, filters, or admin inventory controls in this phase.

4. AdminInventoryPage
- Must be protected by AdminRoute.
- Show a clearly labelled admin inventory shell.
- Include a short placeholder saying that inventory management controls will be added in the next frontend phase.
- Do not implement create/edit/delete/restock controls yet.

5. AppLayout and Header
- Use a shared responsive layout.
- Header should show:
  - application name;
  - Dashboard link when authenticated;
  - Admin Inventory link only for admins;
  - Login/Register links when unauthenticated;
  - signed-in email and a Sign out button when authenticated.
- Sign out must call logout and redirect to /login.

==================================================
G. TAILWIND VISUAL DESIGN
==================================================

Replace all Vite starter content and styling.

Use the existing Tailwind setup. Do not replace Tailwind with another CSS framework.

Create a clean, responsive dealership dashboard style:
- light neutral page background;
- dark navy/slate header;
- one restrained accent colour;
- centered form cards;
- readable labels and visible focus states;
- responsive spacing;
- accessible contrast;
- no external images, UI kits, or copied template assets.

Update frontend/src/index.css only with global base styling appropriate for Tailwind.
Remove unused Vite logo/demo imports and assets if they are no longer referenced.

==================================================
H. QUALITY RULES
==================================================

- Do not modify backend code.
- Do not build vehicle CRUD UI or search UI yet.
- Do not add frontend test tooling in this phase.
- Do not run Git commands or create commits.
- Keep components reasonably small and reusable.
- Run:
  npm run lint
  npm run build
- Report every changed/created file and the results of both commands.

You are working in an existing React/Vite/Tailwind frontend for a car dealership inventory system.

Task: Phase 7 — build the complete customer and administrator inventory user interface on top of the existing FastAPI API.

First inspect:
- frontend/src/api/
- frontend/src/auth/
- frontend/src/components/
- frontend/src/pages/
- frontend/src/App.jsx
- frontend/src/index.css
- frontend/package.json
- backend/app/api/routes/vehicles.py
- backend/app/schemas/vehicle.py

Preserve the existing JavaScript/JSX frontend structure, Axios client, AuthContext, protected routes, sessionStorage behavior, and Tailwind setup.

Do not modify backend code, database models, migrations, requirements, or authentication behavior.

==================================================
A. API FUNCTIONS
==================================================

Create frontend/src/api/vehicles.js using the existing configured Axios client.

Provide small reusable functions matching the backend API exactly:

- listVehicles(params)
  GET /api/vehicles

- searchVehicles(params)
  GET /api/vehicles/search
  Search text must be sent as q.

- getVehicle(vehicleId)
  GET /api/vehicles/{vehicleId}

- createVehicle(payload)
  POST /api/vehicles
  Admin only.

- updateVehicle(vehicleId, payload)
  PUT /api/vehicles/{vehicleId}
  Admin only.

- deleteVehicle(vehicleId)
  DELETE /api/vehicles/{vehicleId}
  Admin only.

- purchaseVehicle(vehicleId)
  POST /api/vehicles/{vehicleId}/purchase
  Requires a logged-in user.

- restockVehicle(vehicleId, quantity)
  POST /api/vehicles/{vehicleId}/restock
  Send JSON:
  { "quantity": positiveInteger }
  Admin only.

Do not duplicate Axios configuration or manually handle authorization headers in these functions. The existing Axios client must remain the single source for API configuration and bearer-token handling.

==================================================
B. REUSABLE UI COMPONENTS
==================================================

Create reusable components where useful, such as:

- VehicleCard.jsx
- VehicleFilters.jsx
- VehicleList.jsx
- Pagination.jsx
- VehicleForm.jsx
- RestockForm.jsx
- ConfirmDialog.jsx or a simple reusable confirmation component
- EmptyState.jsx

Use only as many components as needed to keep pages understandable. Avoid a huge monolithic component.

Requirements:
- Format price safely for display using a currency formatter. Backend decimal values may arrive as strings; convert only for display.
- Clearly show make, model, category, price, and quantity.
- Show an obvious stock badge:
  - “In stock: N” when quantity is greater than zero
  - “Out of stock” when quantity is zero
- Ensure cards and controls are responsive and usable on mobile screens.
- Use accessible labels, button text, focus styles, and error/status messages.

==================================================
C. CUSTOMER DASHBOARD
==================================================

Upgrade DashboardPage into the customer inventory experience.

1. Vehicle display
- Fetch the vehicle list from GET /api/vehicles when the page loads.
- Show responsive vehicle cards in a clean grid.
- Show a loading indicator while data is loading.
- Show an error message with a Retry button if loading fails.
- Show a clear empty state if no vehicles match.

2. Search and filtering
- Add a search input for make, model, or category.
- Add filter controls for:
  - make
  - model
  - category
  - minimum price
  - maximum price
  - in-stock only
- Include an explicit “Apply filters” button.
- Include a “Clear filters” button.
- Use GET /api/vehicles/search when a non-empty search query is applied.
- Use GET /api/vehicles with filter query parameters when search is empty.
- Preserve filters/search while navigating pages.
- Use the backend pagination response fields:
  items, total, page, page_size.
- Include previous/next pagination controls, disabled appropriately, and show useful result information.

3. Purchase flow
- Display a “Purchase” button for every vehicle.
- Disable it while that specific purchase request is in progress.
- Disable it when quantity is zero and label it “Out of stock”.
- When purchase succeeds:
  - display a clear success message;
  - refresh the current list from the API so stock is authoritative;
  - do not decrement quantity only in the browser without refreshing.
- When purchase fails:
  - display the backend error detail when available;
  - refresh the list if relevant.
- The API remains authoritative. Frontend button visibility/disabled state is only convenience, never permission enforcement.

4. Existing dashboard shell
- Keep the authenticated welcome context, but replace the “coming next” placeholder with this real inventory experience.
- Admin users may see the same browsing/purchase experience, but their admin navigation remains available.

==================================================
D. ADMIN INVENTORY PAGE
==================================================

Upgrade AdminInventoryPage into the real admin management interface.

This page is already protected with AdminRoute. Continue to use the backend’s admin-protected API endpoints; do not assume the frontend route alone provides security.

1. Inventory list
- Load vehicles from the API.
- Show a responsive admin-friendly table on wider screens and a usable card/list layout on narrow screens, or use a responsive design that remains readable at all widths.
- Each item must show make, model, category, price, and quantity.
- Include loading, error/retry, and empty states.

2. Add vehicle
- Add a clearly labelled “Add vehicle” form or panel.
- Required fields:
  - make
  - model
  - category
  - price
  - quantity
- Client-side validation:
  - non-blank text fields;
  - price greater than zero;
  - quantity as a non-negative whole number.
- Submit through createVehicle.
- On success:
  - show a confirmation message;
  - reset the form;
  - refresh inventory.
- On backend failure, show a clear error.

3. Edit vehicle
- Allow an admin to edit an existing vehicle.
- Use a clearly labelled edit action that opens an inline panel, modal, or dedicated editable area.
- Pre-fill the current values.
- Allow partial or full updates for make, model, category, price, and quantity.
- Apply the same validation rules.
- Submit through updateVehicle.
- On success, show confirmation and refresh inventory.
- Include a Cancel action that discards unsaved edits.

4. Restock vehicle
- Provide a restock action for every vehicle.
- Require a positive whole-number quantity.
- Submit through restockVehicle.
- On success, show confirmation and refresh inventory.
- Clearly show errors for invalid values or failed API responses.

5. Delete vehicle
- Provide a delete action.
- Require an explicit confirmation step before calling deleteVehicle. A browser confirm dialog is acceptable, but a clear in-page confirmation component is preferred.
- On successful deletion, show a confirmation message and refresh inventory.
- Show API errors if the operation fails.

6. Customer/admin separation
- Customer pages must not show create, edit, delete, or restock controls.
- Admin controls belong only on the existing admin route.
- Continue relying on backend authorization even if UI controls are hidden.

==================================================
E. LOGIN AND REGISTER IMPROVEMENTS
==================================================

Keep the existing working LoginPage and RegisterPage, but improve them only as needed:

- Show useful backend error detail when available.
- Keep client-side required-field validation.
- Register form must validate password confirmation before submission.
- Disable submit buttons while requests are pending.
- Preserve current successful redirect behavior.
- Never show or log passwords.
- Do not add a role-selection control.

==================================================
F. DESIGN AND ACCESSIBILITY
==================================================

Use the existing Tailwind visual language:
- dark navy/slate header;
- restrained purple/blue accent;
- light neutral backgrounds;
- readable cards;
- consistent spacing;
- visible hover and focus states;
- good contrast;
- mobile-first layouts.

Do not add external image assets, paid UI libraries, mock API data, or a new CSS framework.

==================================================
G. QUALITY AND SCOPE
==================================================

- Do not modify backend code.
- Do not add a new frontend testing framework in this phase.
- Do not run Git commands or create commits.
- Do not replace the current authentication architecture.
- Do not trust frontend role checks for real security.
- Run:
  npm run lint
  npm run build
- Report:
  1. all changed/created files;
  2. results of lint and build;
  3. concise manual testing steps for customer purchase and admin inventory management.

  You are working in an existing full-stack car dealership inventory system with a FastAPI backend and React/Vite/Tailwind frontend.

Task: Phase 8 — integration-testing preparation, quality audit, and QA documentation.

First inspect:
- backend/tests/
- backend/app/
- frontend/src/
- frontend/package.json
- README.md
- docs/
- docs/screenshots/
- PROMPTS.md

This is a quality-assurance phase, not a feature-building phase.

==================================================
A. AUTOMATED QUALITY AUDIT
==================================================

Run these commands from their correct directories:

Backend:
- python -m pytest tests -q
- python -m ruff check app tests scripts
- python -m alembic current

Frontend:
- npm run lint
- npm run build

Report the exact outcomes.

If a command fails:
- inspect the actual cause;
- make only the smallest focused correction necessary;
- rerun the failed command and any relevant related checks;
- do not make unrelated refactors or redesign the UI.

Do not attempt to eliminate deprecation warnings that originate inside installed third-party packages unless they reflect an actual error in this project’s code. Report them clearly instead.

==================================================
B. CODE REVIEW CHECKLIST
==================================================

Review the current implementation without changing behavior unless you identify a genuine bug.

Confirm:
- frontend API communication uses VITE_API_BASE_URL and the shared Axios client;
- tokens use sessionStorage rather than localStorage;
- frontend does not decide real permissions; backend authorization remains required;
- passwords, password hashes, JWTs, SECRET_KEY, and database URLs are never logged or shown in UI;
- admin actions use the protected backend API routes;
- customer purchase refreshes inventory from the API afterward;
- purchase is atomic in the backend and cannot make stock negative;
- empty/loading/error states exist for vehicle screens;
- responsive Tailwind classes are used;
- no unused Vite demo content remains;
- no local database, .env file, node_modules, dist output, or Python virtual environment is introduced into Git tracking.

==================================================
C. CREATE QA DOCUMENTATION
==================================================

Create or update this file:

docs/TESTING.md

It must be concise, professional, and truthful. Include these sections:

1. Automated checks
A table listing these commands:
- cd backend && python -m pytest tests -q
- cd backend && python -m ruff check app tests scripts
- cd frontend && npm run lint
- cd frontend && npm run build

Do not invent passing results. If you actually ran them successfully, record the result and date. If not, mark them as “Run locally before submission”.

2. Manual end-to-end checklist
Use a checklist/table with columns:
- Scenario
- Steps
- Expected result
- Result

Include all of these scenarios:
- Customer registration
- Duplicate email rejection
- Valid login
- Invalid-password rejection
- Customer dashboard access
- Vehicle search
- Filter by category and price
- Customer purchase and refreshed stock
- Sold-out purchase rejection
- Admin login and admin route access
- Customer blocked from admin action
- Admin add vehicle
- Admin edit vehicle
- Admin restock vehicle
- Admin delete vehicle
- Invalid price/quantity validation
- Unknown vehicle ID behavior
- Desktop responsiveness
- Mobile responsiveness

For Result, use “Pending manual verification” unless a result can be truthfully established from a completed automated test. Do not falsely claim browser tests were performed.

3. Screenshot evidence plan
List these final screenshot files and what each must show:
- docs/screenshots/customer-dashboard.png
- docs/screenshots/customer-purchase-success.png
- docs/screenshots/admin-inventory.png
- docs/screenshots/mobile-dashboard.png

State that screenshots must not show passwords, tokens, secrets, browser developer tools, or unfinished/error screens.

4. Known non-blocking warnings
If applicable, document third-party dependency deprecation warnings seen during tests, stating that the application tests still pass and the warnings do not originate from project code.

==================================================
D. SCOPE RULES
==================================================

- Do not modify backend features, API contracts, database models, Alembic migrations, or frontend feature behavior unless a real defect is found.
- Do not add a testing framework or dependencies.
- Do not add fake test results.
- Do not create screenshots.
- Do not run Git commands or create a commit.
- Keep documentation easy for a beginner evaluator to follow.

When complete, report:
1. commands run and results;
2. changed files;
3. any real defect fixed, or explicitly state that none was found;
4. any non-blocking warnings.

Update only docs/TESTING.md for accuracy and polish. Do not modify application code, tests, screenshots, package files, or backend files. Do not run Git commands.

Use these verified facts:

Automated checks run successfully on October 25, 2026:
- Backend pytest: 28 passed, 2 non-blocking third-party deprecation warnings.
- Backend Ruff: all checks passed.
- Alembic: bcb453eca097 (head).
- Frontend ESLint: passed.
- Frontend production build: passed.

Manual browser checks successfully completed on October 25, 2026:
- Customer registration succeeded after both FastAPI and Vite servers were running.
- Customer login succeeded.
- Customer dashboard displayed the authenticated customer email.
- Vehicle keyword search for Toyota worked.
- Customer purchase succeeded; success alert appeared and Toyota stock refreshed from 5 to 4.
- Admin login and protected admin route access succeeded.
- Admin add, edit, restock, and delete actions were successfully exercised.
- Desktop and mobile responsive views were checked.
- Final screenshots now exist:
  - docs/screenshots/customer-dashboard.png
  - docs/screenshots/customer-purchase-success.png
  - docs/screenshots/admin-inventory.png
  - docs/screenshots/mobile-dashboard.png

Required edits:
1. Mark the completed manual scenarios above as “Verified manually on October 25, 2026”.
2. Leave only scenarios that were not manually exercised as automated-test verification, without inventing specific test function names. Use wording such as “Covered by the automated backend test suite”.
3. Keep expected outcomes technically correct and concise.
4. Change “Screenshot Evidence Plan” to “Screenshot Evidence”.
5. State that the four listed screenshots were captured from the finished application.
6. Correct all obvious spacing and wording defects, including “fromthe”, “stockbadges”, and “withoutoverflow”.
7. Preserve the known non-blocking warnings section, but do not claim that project code caused the warnings.
8. Do not make up results for any unverified browser behavior.