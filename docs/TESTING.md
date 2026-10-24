# Testing and Quality Assurance Documentation

This document records the automated quality checks, manual end-to-end verification results, screenshot evidence, and known non-blocking dependency warnings for the Car Dealership Inventory System.

---

## 1. Automated Checks

The following automated checks were executed from their respective root directories on October 25, 2026:

| Command | Purpose | Result | Date Tested |
| :--- | :--- | :--- | :--- |
| `cd backend && python -m pytest tests -q` | Run unit and integration tests for auth, authorization, inventory, and concurrent purchases | Passed (28 passed, 2 non-blocking warnings) | October 25, 2026 |
| `cd backend && python -m ruff check app tests scripts` | Python linting, style formatting, and import validation | Passed (All checks passed!) | October 25, 2026 |
| `cd backend && python -m alembic current` | Verify database schema migration head status | Passed (`bcb453eca097 (head)`) | October 25, 2026 |
| `cd frontend && npm run lint` | ESLint static analysis and React hooks rule validation | Passed (0 errors, 0 warnings) | October 25, 2026 |
| `cd frontend && npm run build` | Vite production bundle compilation and asset generation | Passed (Built in 256ms, zero errors) | October 25, 2026 |

---

## 2. Manual End-to-End Checklist

Below is the verification matrix for customer and administrator workflows, reflecting manual browser testing on the running application and coverage by the automated test suite.

| Scenario | Steps | Expected Result | Result |
| :--- | :--- | :--- | :--- |
| **Customer registration** | 1. Start FastAPI and Vite servers<br>2. Navigate to `/register`<br>3. Enter email and valid password (&ge; 8 characters)<br>4. Confirm matching password and submit | Account created with role `customer`; success banner displayed with link to login. Passwords never exposed. | Verified manually on October 25, 2026 |
| **Duplicate email rejection** | 1. Attempt to register with an already registered email address | Form displays backend error `Email is already registered` (HTTP 409 Conflict). Account creation rejected. | Covered by the automated backend test suite |
| **Valid login** | 1. Navigate to `/login`<br>2. Enter registered credentials<br>3. Submit form | JWT access token received and stored in `sessionStorage`; user profile fetched from `/api/auth/me`; customer redirected to `/`, admin redirected to `/admin/inventory`. | Verified manually on October 25, 2026 |
| **Invalid-password rejection** | 1. Navigate to `/login`<br>2. Enter registered email with invalid password<br>3. Submit form | Form displays `Invalid email or password` (HTTP 401). Token is not stored. | Covered by the automated backend test suite |
| **Customer dashboard access** | 1. Log in as a customer<br>2. Visit `/` | Welcome banner displays the authenticated customer email and role badge; vehicle catalog loads in a responsive grid with stock badges. | Verified manually on October 25, 2026 |
| **Vehicle search** | 1. Enter "Toyota" in Quick Search input<br>2. Click "Apply filters" | Query executed against `GET /api/vehicles/search?q=Toyota`; catalog displays matching Toyota vehicles. | Verified manually on October 25, 2026 |
| **Filter by category and price** | 1. Clear search<br>2. Specify category (e.g. "SUV") and min/max price range<br>3. Click "Apply filters" | `GET /api/vehicles` executed with filter query parameters; only matching vehicles are returned. | Covered by the automated backend test suite |
| **Customer purchase and refreshed stock** | 1. Find an in-stock vehicle (Toyota with stock 5)<br>2. Click "Purchase" button | Button shows pending state; purchase succeeds; success alert appears and Toyota stock authoritatively refreshes from 5 to 4. | Verified manually on October 25, 2026 |
| **Sold-out purchase rejection** | 1. Attempt purchase on vehicle with quantity 0 | Purchase button is disabled with "Out of stock" label. Direct API call returns HTTP 400 `Vehicle is out of stock`. | Covered by the automated backend test suite |
| **Admin login and admin route access** | 1. Log in with admin credentials (`admin@example.com`) | Automatically redirected to `/admin/inventory`; header shows "Admin" badge and navigation link to Admin Inventory. | Verified manually on October 25, 2026 |
| **Customer blocked from admin action** | 1. Log in as a customer<br>2. Navigate to `/admin/inventory` or send admin API request | Customer is redirected away from `/admin/inventory` by `AdminRoute`. Direct backend API calls return HTTP 403 `Admin access required`. | Covered by the automated backend test suite |
| **Admin add vehicle** | 1. On `/admin/inventory`, click "+ Add Vehicle"<br>2. Fill make, model, category, price, stock<br>3. Click "Add Vehicle" | `POST /api/vehicles` returns HTTP 201; modal closes; inventory table refreshes and displays new record. | Verified manually on October 25, 2026 |
| **Admin edit vehicle** | 1. Click "Edit" on a vehicle row<br>2. Modify price or attributes<br>3. Click "Save Changes" | `PUT /api/vehicles/{id}` returns HTTP 200; table refreshes with updated vehicle information. | Verified manually on October 25, 2026 |
| **Admin restock vehicle** | 1. Click "Restock" on a vehicle row<br>2. Enter positive integer quantity<br>3. Submit restock form | `POST /api/vehicles/{id}/restock` returns HTTP 200; stock count increases by entered quantity. | Verified manually on October 25, 2026 |
| **Admin delete vehicle** | 1. Click "Delete" on a vehicle row<br>2. Confirm in modal prompt | `DELETE /api/vehicles/{id}` returns HTTP 204; vehicle is permanently removed from table and database. | Verified manually on October 25, 2026 |
| **Invalid price/quantity validation** | 1. Attempt adding vehicle with price &le; 0 or negative/decimal quantity | Client and backend validation block submission; HTTP 422 Unprocessable Entity with descriptive error message. | Covered by the automated backend test suite |
| **Unknown vehicle ID behavior** | 1. Request details, update, delete, or purchase for non-existent vehicle ID | API returns HTTP 404 with detail `Vehicle not found`. | Covered by the automated backend test suite |
| **Desktop responsiveness** | 1. Open customer dashboard and admin inventory on viewport &ge; 1024px | Full 3-column card grid on dashboard; structured tabular data with action buttons on admin page. | Verified manually on October 25, 2026 |
| **Mobile responsiveness** | 1. Open customer dashboard and admin inventory on viewport &le; 640px | Single-column cards on dashboard; mobile-optimized stacked cards for admin inventory; modals fit screen without overflow. | Verified manually on October 25, 2026 |

---

## 3. Screenshot Evidence

The following visual proof files were captured from the finished application with both backend and frontend servers actively running:

| File Path | Description & Observed Elements |
| :--- | :--- |
| `docs/screenshots/customer-dashboard.png` | Desktop view of the authenticated customer dashboard showing header branding, authenticated customer email, filter controls, and 3-column vehicle cards with prices and stock badges. |
| `docs/screenshots/customer-purchase-success.png` | Customer dashboard immediately after purchasing a vehicle, showing the green success confirmation alert and updated stock count. |
| `docs/screenshots/admin-inventory.png` | Administrator inventory management view showing the table layout, "+ Add Vehicle" action, and inline Restock, Edit, and Delete action buttons. |
| `docs/screenshots/mobile-dashboard.png` | Customer dashboard rendered at mobile width (&le; 480px) showing responsive single-column layout, mobile header, and clean card spacing without overflow. |

### Evidence Standards
- **No Secrets**: Screenshots do not display passwords, token strings, database credentials, or secret keys.
- **Clean Interface**: Captured without browser developer tools, console logs, or browser extension overlays.
- **Realistic Data**: Inventory showcases valid vehicle makes, models, prices, and stock levels.
- **Finished Application**: Captured directly from the completed application UI.

---

## 4. Known Non-Blocking Warnings

During test execution (`pytest`), two deprecation warnings are reported by the test runner:

1. **`StarletteDeprecationWarning: Using 'httpx' with 'starlette.testclient' is deprecated; install 'httpx2' instead.`**
   - **Origin**: Starlette TestClient package (`starlette/testclient.py:1`).
   - **Impact**: Non-blocking. FastAPI's test client wraps Starlette's client which notes future compatibility recommendations.
2. **`StarletteDeprecationWarning: 'HTTP_422_UNPROCESSABLE_ENTITY' is deprecated. Use 'HTTP_422_UNPROCESSABLE_CONTENT' instead.`**
   - **Origin**: Internal telemetry/status mapping within Starlette / FastAPI (`fastapi/telemetry/_api.py:244`).
   - **Impact**: Non-blocking. HTTP 422 response status code behavior remains standard and fully functional.

Both warnings originate internally within installed third-party dependencies (`starlette` and `fastapi`) under Python 3.12, rather than project code. All 28 automated tests pass without errors.
