# Pharmacy Management System

A comprehensive, full-stack web application designed to streamline and automate pharmacy operations. This system centralizes inventory tracking, point-of-sale (POS) transactions, supplier and customer management, prescription verification, and comprehensive reporting into a single, modern interface.

---

## Features

- **Authentication & Role-Based Access Control:** Secure JWT-based login with distinct roles (Admin, Pharmacist, Staff).
- **Dashboard:** Real-time metrics overview, revenue charts, and low-stock indicators.
- **Medicine Management:** Complete CRUD operations for medicines with batch tracking and expiry alerts.
- **Inventory Management:** Automated real-time tracking of stock levels via `inventory_transactions`.
- **POS / Sales:** Interactive Point of Sale system with stock validation, prescription checks, and dynamic cart calculations.
- **Purchase Management:** Restock medicines through supplier purchases that automatically increase inventory.
- **Customer Management:** Maintain patient/customer records and transaction history.
- **Supplier Management:** Manage vendor details and track purchase orders.
- **Prescription Management:** Securely upload, view, verify, reject, and dispense medical prescriptions.
- **Order Management:** Track customer orders, update payment statuses, and manage fulfillment.
- **Reports and Analytics:** Advanced data visualization for sales trends, revenue, and inventory valuation.
- **Notifications:** Automated system alerts for low stock, expiring medicines, and pending prescriptions.
- **User Management:** Admin-exclusive portal to add, edit, and revoke system access.
- **Settings:** Configurable system preferences and store details.
- **PDF Invoice Generation:** Automated digital invoice creation on successful sales.

---

## Technology Stack

### Frontend
- **React** (UI Library)
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling)
- **Recharts** (Data Visualization)
- **Lucide React** (Icons)
- **Axios** (HTTP Client)
- **React Hook Form** (Form Handling)

### Backend
- **Node.js** (Runtime)
- **Express.js** (Web Framework)
- **JWT** (JSON Web Tokens for Auth)
- **bcrypt** (Password Hashing)
- **Multer** (File Uploads)
- **PDFKit** (PDF Generation)

### Database
- **MySQL** (Relational Database)

---

## System Architecture

The application follows a standard decoupled full-stack architecture:

```text
React Frontend (Vite)
         ↓
    HTTP / REST API (Axios)
         ↓
Node.js / Express Backend
         ↓
    MySQL Database
```

---

## Core Workflows

- **Purchase Workflow:** 
  `Supplier` → `Purchase Order` → `Stock Increase` → `Inventory Transaction Logged`
- **Sale Workflow:** 
  `Customer` → `POS Cart` → `Stock/Expiry/Prescription Validation` → `Sale Execution` → `Stock Decrease` → `Inventory Transaction` → `PDF Invoice Generated`
- **Prescription Workflow:** 
  `Upload (Image/PDF)` → `Pending Status` → `Pharmacist Verification/Rejection` → `Dispense`

---

## Database

The MySQL database (`pharmacy_db`) is fully normalized and includes the following primary tables:
- `users`
- `medicines`
- `customers`
- `suppliers`
- `sales` & `sale_items`
- `purchases` & `purchase_items`
- `inventory_transactions`
- `prescriptions` & `prescription_items`
- `orders` & `order_items`
- `notifications`

---

## Project Structure

```text
Pharmacy_Management_System/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Request handlers
│   ├── middleware/      # JWT Auth & Role validation
│   ├── routes/          # API endpoints
│   ├── scripts/         # SQL initialization & Seeders
│   ├── uploads/         # Invoices and Prescriptions
│   ├── .env.example
│   ├── package.json
│   └── server.js        # Main Express entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── assets/      
│   │   ├── components/  # Reusable UI (Sidebar, Navbar)
│   │   ├── context/     # React Context (Auth)
│   │   ├── pages/       # Dashboard, POS, Medicines, etc.
│   │   ├── services/    # Axios API config
│   │   ├── App.jsx      # React Router setup
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── api_contracts.md     # Detailed API documentation
└── README.md
```

---

## Installation

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/SRIMADHAVI99/Pharmacy_Management_System.git
cd Pharmacy_Management_System
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pharmacy_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
```

### 4. Database Setup
Ensure MySQL is running. Create the database and run the initialization and seed scripts:
```bash
mysql -u root -p pharmacy_db < scripts/init.sql
node scripts/seed.js
```

### 5. Start Backend
```bash
npm start
# Server runs on http://localhost:5000
```

### 6. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Demo Login

The `seed.js` script provisions the following default demo credentials for testing purposes:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `password123` |
| **Pharmacist** | `pharmacist` | `password123` |
| **Staff** | `staff` | `password123` |

*(Note: Always change these credentials in a production environment).*

---

## API

The backend exposes a comprehensive RESTful API documented in `api_contracts.md`. Main route groups include:
- `/api/auth` - Login and token generation
- `/api/dashboard` - High-level metrics and chart data
- `/api/medicines` - Medicine inventory CRUD
- `/api/sales` - POS transactions and invoice generation
- `/api/purchases` - Stock replenishment
- `/api/prescriptions` - Prescription uploads and verification
- `/api/reports` - Deep-dive aggregations (Sales & Inventory)
- `/api/users` - Role management

---

## Screenshots

*(Screenshots of the Dashboard, POS system, and Reports will be added here)*

---

## Security

The application implements standard security best practices:
- **Password Hashing:** Passwords are never stored in plain text (uses `bcrypt`).
- **JWT Authentication:** Stateless, secure token-based login.
- **Role-Based Authorization:** Strict middleware (`isAdmin`, `isPharmacist`) prevents unauthorized API access.
- **Input Validation:** Backend endpoints strictly validate stock requirements and expiration dates.
- **Protected Routes:** Frontend `ProtectedRoute` wrapper secures the UI.
- **Environment Variables:** Credentials and secrets are kept out of source control.

---

## Testing & Verification

The core workflows have been rigorously verified via End-to-End (E2E) simulated test workflows ensuring:
- Purchases successfully increment database stock.
- Sales correctly decrement stock and generate valid PDF invoices.
- **Strict Constraints Enforced:**
  - Cannot sell more quantity than available stock.
  - Cannot sell medicines past their `expiry_date`.
  - Cannot sell `requires_prescription` medicines without an active verification flag.
- Role isolation correctly blocks Staff from accessing Admin configuration endpoints.

---

## Future Enhancements

- **Email Integration:** Send automated PDF invoices directly to customer emails.
- **Barcode Scanner Support:** Integrate physical barcode scanning in the POS module.
- **Advanced Tax Configurations:** Multi-tier GST/VAT settings.
- **Automated Backup:** Scheduled database dumps for disaster recovery.

---

## Author

**Kokku Sri Madhavi**
