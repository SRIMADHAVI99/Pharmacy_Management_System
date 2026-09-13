# API Contracts for Pharmacy Management System

## Base URL: `http://localhost:5000/api`

### Auth (`/auth`)
- `POST /login` -> `{ username, password }` -> Returns `{ token, user: { id, username, role } }`
- `GET /me` -> Returns current user. (Requires Auth)

### Medicines (`/medicines`)
- `GET /` -> Returns `[{id, name, generic_name, category, ...supplier_name}]`
- `GET /:id` -> Returns single medicine
- `POST /` -> Create medicine
- `PUT /:id` -> Update medicine
- `DELETE /:id` -> Delete medicine

### Suppliers (`/suppliers`)
- CRUD operations similar to medicines.

### Customers (`/customers`)
- CRUD operations similar to medicines.

### Prescriptions (`/prescriptions`)
- `GET /` -> List all prescriptions
- `POST /` (multipart/form-data) -> `{ customer_id, doctor_name, expiry_date, image: File, medicines: JSON string array }`
- `PUT /:id/verify` -> `{ status: 'Verified' | 'Rejected' }`

### Sales (`/sales`)
- `GET /` -> List all sales
- `GET /:id` -> Get sale details (with items)
- `POST /` -> Create sale (Transaction: reduce stock, create invoice) -> `{ customer_id, items: [{medicine_id, quantity, unit_price}], payment_method, discount, tax }`
- `GET /:id/invoice` -> Download PDF invoice

### Purchases (`/purchases`)
- `GET /` -> List purchases
- `POST /` -> Create purchase (Transaction: increase stock) -> `{ supplier_id, items: [{medicine_id, batch_number, quantity, purchase_price, expiry_date}] }`

### Inventory (`/inventory`)
- `GET /transactions` -> List inventory transactions

### Dashboard & Reports (`/dashboard`)
- `GET /stats` -> Returns total medicines, customers, suppliers, today's sales, today's revenue, low stock count, expiring count.
- `GET /charts` -> Returns sales trend, top medicines.

### Notifications (`/notifications`)
- `GET /` -> List notifications
- `PUT /:id/read` -> Mark as read

## Authentication & Authorization Middleware
- `authMiddleware`: verifies JWT.
- `roleMiddleware(['Admin', 'Pharmacist'])`: verifies user role.
