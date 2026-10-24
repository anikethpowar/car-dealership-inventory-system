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