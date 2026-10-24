🚗 Car Dealership Inventory System

<p align="center">
  <strong>A full-stack vehicle inventory application for customers and dealership administrators.</strong><br />
  Browse, filter, purchase, restock, and manage vehicles through a responsive web interface.
</p>

<p align="center">
  <img alt="FastAPI" src="https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/UI-React-149eca?logo=react&logoColor=white" />
  <img alt="Database" src="https://img.shields.io/badge/Database-SQLite-003b57?logo=sqlite&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/Backend%20tests-28%20passing-2ea44f" />
  <img alt="License" src="https://img.shields.io/badge/License-See%20LICENSE-6b7280" />
</p>

Start here: Follow Run locally to get the app running in two terminals. No deployment is required; this project is ready to run locally for coursework review.

✨ What this project does

For customers

For administrators

Create an account and sign in securely

Sign in to a protected admin workspace

Browse vehicles with price and stock status

Add, edit, restock, and delete inventory

Search by make, model, or category

See inventory update immediately after actions

Filter by make, model, category, price, and stock

Use the same secure API as the customer app

Purchase one vehicle unit at a time



The backend is the source of truth for every permission and stock update. Hiding an admin button in the UI never grants access: the API enforces the role checks.

🧭 How the app fits together

flowchart LR
    C[Customer or Admin] --> UI[React + Vite + Tailwind]
    UI -->|Axios HTTP requests| API[FastAPI API]
    API -->|JWT authentication\nrole checks| S[Services]
    S --> ORM[SQLAlchemy]
    ORM --> DB[(SQLite database)]
    M[Alembic migrations] --> DB

The important flow

A user signs in on the React website.

FastAPI returns a JWT access token.

The browser keeps the token only for the current session using sessionStorage.

Axios adds that token to protected API requests.

FastAPI checks the token and the user role from the database before allowing sensitive actions.

SQLAlchemy safely reads or changes the persistent SQLite inventory.

🛠 Technology

Area

Tools used

Backend

FastAPI, SQLAlchemy 2, Alembic, Pydantic v2

Security

JWT (python-jose), Argon2 password hashing (pwdlib)

Database

SQLite

Frontend

React 19, Vite, React Router, Tailwind CSS v4, Axios

Quality

Pytest, Ruff, ESLint

📁 Project map

car-dealership-inventory-system/
├── backend/                 # FastAPI application, migrations, tests, and seed script
│   ├── app/                 # Routes, models, schemas, services, security
│   ├── alembic/             # Database migrations
│   ├── scripts/             # Development helpers, including seed_admin.py
│   └── tests/               # Auth, role, inventory, and purchase tests
├── frontend/                # React + Vite + Tailwind single-page application
│   └── src/                 # API client, auth state, pages, and reusable components
├── docs/                    # Test evidence and screenshots
├── PROMPTS.md               # Raw AI prompt evidence
└── README.md                # You are here

✅ Requirements

Install these once before starting:

Requirement

Recommended version

Check it with

Git

Current version

git --version

Python

Python 3.12 (3.11+ should work)

python3 --version

Node.js

Node 22 (Node 20+ should work)

node --version

npm

npm 10+

npm --version

Linux Mint note: Keep the backend and frontend running in separate terminal windows. The frontend alone cannot register or log in users; it needs the FastAPI backend running at the same time.

🚀 Run locally, step by step

1. Clone the project

git clone https://github.com/anikethpowar/car-dealership-inventory-system.git
cd car-dealership-inventory-system

2. Start the backend — Terminal 1

Create and activate a virtual environment from the project root:

python3 -m venv venv
source venv/bin/activate

Install backend packages:

cd backend
python -m pip install -r requirements.txt

Create your local configuration file and database tables:

cp .env.example .env
python -m alembic upgrade head

Create the local demonstration administrator:

python -m scripts.seed_admin

Start FastAPI and leave this terminal running:

uvicorn app.main:app --reload

You should see FastAPI running at http://127.0.0.1:8000.

3. Start the frontend — Terminal 2

Open a new terminal window. From the repository root, run:

cd frontend
npm ci
cp .env.example .env
npm run dev

Open the address Vite prints, normally http://localhost:5173.

4. Sign in and explore

Use the seeded development administrator account:

Field

Value

Email

admin@example.com

Password

AdminPass123!

Development only: These are intentionally public demo credentials. Never use default credentials in a production deployment.

Or choose Register in the app to make a normal customer account. Customer accounts cannot become administrators through the browser.

🔗 Useful local links

Resource

Link

React application

http://localhost:5173

API health check

http://127.0.0.1:8000/api/health

Interactive API documentation

http://127.0.0.1:8000/docs

Alternative API documentation

http://127.0.0.1:8000/redoc

🧪 Verify the project

Run these checks before submitting or after making changes.

Backend checks

cd backend
python -m pytest tests -q
python -m ruff check app tests scripts
python -m alembic current

Frontend checks

cd frontend
npm run lint
npm run build

Current verified result: 28 backend tests passing, Ruff clean, ESLint clean, and a successful Vite production build.

For the complete manual checklist, results, and known third-party warnings, see docs/TESTING.md.

📸 Application walkthrough

<p align="center">
  <img src="docs/screenshots/customer-dashboard.png" alt="Customer dashboard with filters and a vehicle card" width="48%" />
  <img src="docs/screenshots/customer-purchase-success.png" alt="Customer purchase success and refreshed stock" width="48%" />
</p>

<p align="center"><em>Customer browsing, search/filter controls, and an authoritative stock refresh after purchase.</em></p>

<p align="center">
  <img src="docs/screenshots/admin-inventory.png" alt="Administrator inventory management interface" width="70%" />
</p>

<p align="center"><em>Admin inventory management: add, edit, restock, and delete actions.</em></p>

<p align="center">
  <img src="docs/screenshots/mobile-dashboard.png" alt="Responsive customer dashboard at mobile width" width="32%" />
</p>

<p align="center"><em>Mobile-friendly responsive customer dashboard.</em></p>

🔌 API at a glance

<details>
<summary><strong>Authentication and account routes</strong></summary>

Method

Route

Access

Purpose

GET

/api/health

Public

Check server and database connectivity

POST

/api/auth/register

Public

Register a customer account

POST

/api/auth/login

Public

Receive a JWT access token

GET

/api/auth/me

Signed in

View current user profile and role

GET

/api/admin/me

Admin

Verify administrator access

</details>

<details>
<summary><strong>Vehicle inventory routes</strong></summary>

Method

Route

Access

Purpose

GET

/api/vehicles

Public

List vehicles, filters, and pagination

GET

/api/vehicles/search

Public

Search make, model, or category

GET

/api/vehicles/{vehicle_id}

Public

View one vehicle

POST

/api/vehicles

Admin

Add a vehicle

PUT

/api/vehicles/{vehicle_id}

Admin

Update a vehicle

DELETE

/api/vehicles/{vehicle_id}

Admin

Delete a vehicle

POST

/api/vehicles/{vehicle_id}/purchase

Signed in

Purchase one unit safely

POST

/api/vehicles/{vehicle_id}/restock

Admin

Increase stock

</details>

🔐 Security and design choices

Passwords are hashed with Argon2 through pwdlib; plain-text passwords are never stored.

JWT tokens expire and are signed server-side with HS256.

Session-only storage: the frontend uses sessionStorage, not localStorage.

Backend permissions win: FastAPI dependencies validate the current user and admin role for protected operations.

Purchases are atomic: the database decrements stock only when quantity > 0, preventing negative inventory under concurrent requests.

Local-only files stay local: the SQLite database, .env files, virtual environments, node_modules, and build output are ignored by Git.

🧯 Quick troubleshooting

Problem

What to check

Registration or login fails from the website

Confirm both terminals are running: FastAPI on port 8000 and Vite on port 5173.

node: command not found

Install/activate Node.js, then check node --version and npm --version.

Database/table error

From backend/, run python -m alembic upgrade head.

Admin login does not work

From backend/, run python -m scripts.seed_admin, then sign in with the documented demo account.

Port already in use

Stop the older server with Ctrl + C, then start the command again.

📦 Deployment status

This project is currently configured for local coursework demonstration. There is no verified public deployment URL yet.

🤖 AI usage and transparency

AI assistance was used openly during this project:

ChatGPT helped with planning, architecture guidance, Git workflow guidance, QA planning, and documentation guidance.

Google Antigravity in VS Code helped generate and refine implementation code from scoped prompts.

The developer reviewed generated work, ran tests/builds locally, completed browser testing, captured screenshots, made deliberate decisions, and committed/pushed the work.

The unedited prompt record is available in PROMPTS.md. AI-assisted commits include an attribution trailer where applicable.

📄 License

See LICENSE.