# SITA Foundation — Technical Requirements Document (TRD)

**Version:** 1.0  
**Date:** April 12, 2026  
**Status:** Final — v1 Scope  
**Prepared by:** SITA Foundation Engineering Team  
**Classification:** Internal / Confidential

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [Business Logic Functions](#5-business-logic-functions)
6. [Security Requirements](#6-security-requirements)
7. [Deployment Architecture — GCP Mumbai](#7-deployment-architecture--gcp-mumbai)
8. [Performance Requirements](#8-performance-requirements)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [Developer Handover Requirements](#10-developer-handover-requirements)

---

## 1. System Architecture Overview

SITA Foundation v1 is a **monolithic REST API backend** serving four distinct client applications. The architecture follows a layered MVC pattern and is designed for horizontal scalability behind a load balancer.

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Member App     │  │ Delivery App │  │   Survey App        │   │
│  │  (Flutter)      │  │  (Flutter)   │  │   (Flutter)         │   │
│  └────────┬────────┘  └──────┬───────┘  └──────────┬──────────┘   │
│           │                  │                       │             │
│  ┌────────┴──────────────────┴───────────────────────┴──────────┐  │
│  │                    Admin Panel (React)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER (GCP)                       │
│                    HTTPS Load Balancer / Cloud Run                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER (Node.js / Express)             │
│                                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│   │  Auth    │  │  Orders  │  │  Admin   │  │  Survey          │  │
│   │  Routes  │  │  Routes  │  │  Routes  │  │  Routes          │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │               Middleware Layer                               │  │
│   │   JWT Auth │ Rate Limiting │ CORS │ Validation │ Error       │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │               Business Logic Layer                           │  │
│   │   Split Calc │ OTP Gen │ Order Number Gen │ Pagination       │  │
│   └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                      │
│                                                                     │
│   ┌─────────────────────────────┐   ┌──────────────────────────┐   │
│   │   PostgreSQL 14+            │   │   Cloud Storage (GCS)    │   │
│   │   (Cloud SQL — GCP Mumbai)  │   │   (Product Images)       │   │
│   └─────────────────────────────┘   └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                            │
│                                                                     │
│   ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────────┐   │
│   │ Razorpay │  │  Twilio  │  │  Firebase   │  │ Google Maps  │   │
│   │ Payments │  │   SMS    │  │     FCM     │  │   Platform   │   │
│   └──────────┘  └──────────┘  └─────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Request Flow

```
Client App
   │
   │ HTTPS POST /api/v1/orders
   ▼
Rate Limiter (express-rate-limit)
   │
   ▼
CORS Middleware
   │
   ▼
JWT Auth Middleware (verify Bearer token, attach req.user)
   │
   ▼
express-validator (input validation, sanitization)
   │
   ▼
Route Handler (business logic, DB queries via Sequelize)
   │
   ├── Success → JSON response + 2xx status
   └── Error   → Error Middleware → JSON error + 4xx/5xx status
```

### 1.3 Data Flow — Order Placement

```
Member App
   │
   │ POST /orders { vendor_id, items[], payment_method, delivery_address }
   ▼
[1] Validate member is active + membership_paid=true
[2] Validate vendor is active
[3] For each item: validate product exists, belongs to vendor, is approved + available
[4] For each item: validate quantity >= MOQ
[5] Calculate total_amount = Σ(item.quantity × item.price_per_unit)
[6] Split: sita_commission = total × 2%, vendor_amount = total × 98%
[7] If payment_method='wallet': check member.sita_wallet_balance >= total_amount
[8] BEGIN DB TRANSACTION
   [8a] Create Order record
   [8b] Create OrderItems records (with product name/unit snapshots)
   [8c] If wallet payment: debit member.sita_wallet_balance, create WalletTransaction
   [8d] COMMIT
[9] Return { order_number, status, delivery_otp (dev only), ... }
```

---

## 2. Tech Stack

### 2.1 Backend

| Component | Technology | Version |
|---|---|---|
| Runtime | Node.js | 18+ LTS |
| Framework | Express.js | 4.19.2 |
| ORM | Sequelize | 6.37.3 |
| Database Driver | pg (node-postgres) | 8.12.0 |
| Authentication | jsonwebtoken | 9.0.2 |
| Password Hashing | bcryptjs | 2.4.3 |
| Input Validation | express-validator | 7.1.0 |
| Rate Limiting | express-rate-limit | 7.3.1 |
| CORS | cors | 2.8.5 |
| Environment Config | dotenv | 16.4.5 |
| UUID Generation | uuid | 10.0.0 |
| Dev Hot-Reload | nodemon | 3.1.4 |
| Migration CLI | sequelize-cli | 6.6.2 |

### 2.2 Admin Frontend

| Component | Technology | Version |
|---|---|---|
| Framework | React | 18.3.1 |
| Build Tool | Vite | 5.3.1 |
| HTTP Client | axios | latest |
| Routing | React Router | latest |
| State Management | React Context API | (built-in) |

### 2.3 Public Website

| Component | Technology | Version |
|---|---|---|
| Framework | React | 19.2.5 |
| Build Tool | Vite | 8.0.8 |

### 2.4 Mobile Applications (Flutter)

| App | SDK | Key Packages |
|---|---|---|
| Member App | Dart 3.11.4 / Flutter | http, get (GetX), shared_preferences, image_picker, cached_network_image, pin_code_fields |
| Delivery App | Dart 3.11.4 / Flutter | http, get (GetX), shared_preferences |
| Survey App | Dart 3.11.4 / Flutter | http |

### 2.5 Infrastructure

| Component | Technology |
|---|---|
| Cloud Provider | Google Cloud Platform (GCP) |
| Region | asia-south1 (Mumbai) |
| App Hosting | Cloud Run (containerized) |
| Database | Cloud SQL — PostgreSQL 14 |
| File Storage | Google Cloud Storage |
| CDN | Cloud CDN (via Load Balancer) |
| Secrets | Secret Manager |
| Container Registry | Artifact Registry |

---

## 3. Database Schema

**Database:** PostgreSQL 14+  
**Database Name:** `sita_foundation`  
**ORM:** Sequelize 6 (with migrations)

All tables include `created_at` and `updated_at` TIMESTAMP columns (auto-managed by Sequelize). Primary keys are UUIDs using `UUIDV4` default.

### 3.1 Entity-Relationship Overview

```
admins          (standalone — system administrators)
members         (1) ─────── (M) orders
                (1) ─────── (M) sita_wallet_transactions
                (1) ─────── (M) disputes
                (1) ─────── (M) master_contracts

vendors         (1) ─────── (M) products
                (1) ─────── (M) orders
                (1) ─────── (M) disputes
                (1) ─────── (M) master_contracts

orders          (1) ─────── (M) order_items
                (1) ─────── (1) disputes
                (1) ─────── (M) sita_wallet_transactions

products        (1) ─────── (M) order_items
                (1) ─────── (M) master_contracts

survey_entities (1) ─────── (M) consumption_surveys
```

---

### 3.2 Table: `admins`

Stores admin portal users with role-based access control.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Login identifier |
| `password` | VARCHAR(255) | NOT NULL | bcrypt hash (12 rounds) |
| `role` | ENUM | NOT NULL, DEFAULT 'admin' | Values: `superadmin`, `admin` |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Soft deactivation |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Notes:** Password is automatically hashed via Sequelize `beforeCreate`/`beforeUpdate` hooks using bcrypt with 12 salt rounds.

---

### 3.3 Table: `members`

Stores hotelier member accounts and their platform state.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(150) | NULLABLE | Optional |
| `phone` | VARCHAR(15) | NOT NULL, UNIQUE | Primary identity; used for OTP login |
| `hotel_name` | VARCHAR(200) | NOT NULL | |
| `hotel_address` | TEXT | NULLABLE | |
| `city` | VARCHAR(100) | NULLABLE | |
| `state` | VARCHAR(100) | NULLABLE | |
| `pincode` | VARCHAR(10) | NULLABLE | |
| `gstin` | VARCHAR(20) | NULLABLE | GST Identification Number |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Values: `pending`, `active`, `suspended`, `rejected` |
| `membership_paid` | BOOLEAN | NOT NULL, DEFAULT false | Must be true to place orders |
| `membership_fee` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Stored at time of payment |
| `membership_paid_at` | TIMESTAMP | NULLABLE | |
| `sita_wallet_balance` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Cached; updated on every transaction |
| `otp` | VARCHAR(6) | NULLABLE | Current OTP for login |
| `otp_expires_at` | TIMESTAMP | NULLABLE | OTP TTL (default: 10 minutes from issue) |
| `rejection_reason` | TEXT | NULLABLE | Set by admin on rejection |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Instance Method:** `isOtpValid(inputOtp)` — checks `this.otp === inputOtp && this.otp_expires_at > new Date()`.

---

### 3.4 Table: `vendors`

Stores supplier/vendor company profiles.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `name` | VARCHAR(100) | NOT NULL | Contact person name |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | |
| `phone` | VARCHAR(15) | NOT NULL | |
| `company_name` | VARCHAR(200) | NOT NULL | |
| `gstin` | VARCHAR(20) | NULLABLE | |
| `category` | ENUM | NULLABLE | See values below |
| `description` | TEXT | NULLABLE | |
| `address` | TEXT | NULLABLE | |
| `city` | VARCHAR(100) | NULLABLE | |
| `state` | VARCHAR(100) | NULLABLE | |
| `bank_account_number` | VARCHAR(30) | NULLABLE | For disbursement reference |
| `bank_ifsc` | VARCHAR(15) | NULLABLE | |
| `bank_account_name` | VARCHAR(100) | NULLABLE | |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Values: `pending`, `active`, `suspended`, `rejected` |
| `rejection_reason` | TEXT | NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Category ENUM values:** `food_beverages`, `housekeeping`, `linen_laundry`, `amenities`, `equipment`, `technology`, `furniture`, `other`

---

### 3.5 Table: `products`

Stores vendor product listings (subject to admin approval).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `vendor_id` | UUID | FK → vendors.id, CASCADE | |
| `name` | VARCHAR(200) | NOT NULL | |
| `description` | TEXT | NULLABLE | |
| `category` | ENUM | NULLABLE | Same enum as vendors.category |
| `unit` | VARCHAR(30) | NOT NULL | e.g., `kg`, `litre`, `piece`, `dozen` |
| `price_per_unit` | DECIMAL(10,2) | NOT NULL | Base price (may be overridden by master_contracts) |
| `moq` | INTEGER | NOT NULL, DEFAULT 1 | Minimum Order Quantity |
| `available` | BOOLEAN | NOT NULL, DEFAULT true | Vendor-toggleable availability |
| `approved` | BOOLEAN | NOT NULL, DEFAULT false | Must be true to appear in catalog |
| `image_url` | VARCHAR(500) | NULLABLE | GCS URL |
| `sku` | VARCHAR(50) | NULLABLE | Vendor SKU reference |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Indexes:** `vendor_id`, `category`

---

### 3.6 Table: `orders`

Central transaction record linking members, vendors, and the financial split.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `order_number` | VARCHAR(20) | NOT NULL, UNIQUE | Format: `SITA-{timestamp}-{random4}` |
| `member_id` | UUID | FK → members.id, RESTRICT | |
| `vendor_id` | UUID | FK → vendors.id, RESTRICT | |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Values: `pending`, `confirmed`, `dispatched`, `delivered`, `cancelled`, `disputed` |
| `total_amount` | DECIMAL(12,2) | NOT NULL | Sum of all order_items.total_price |
| `sita_commission` | DECIMAL(12,2) | NOT NULL | 2% of total_amount |
| `vendor_amount` | DECIMAL(12,2) | NOT NULL | 98% of total_amount |
| `payment_method` | ENUM | NOT NULL, DEFAULT 'bank_transfer' | Values: `wallet`, `bank_transfer`, `upi`, `cash` |
| `payment_status` | ENUM | NOT NULL, DEFAULT 'pending' | Values: `pending`, `paid`, `refunded` |
| `delivery_otp` | VARCHAR(6) | NULLABLE | 6-digit OTP for delivery confirmation |
| `delivery_otp_verified` | BOOLEAN | NOT NULL, DEFAULT false | Set true on successful OTP confirmation |
| `delivery_address` | TEXT | NULLABLE | |
| `expected_delivery_date` | DATE | NULLABLE | |
| `delivered_at` | TIMESTAMP | NULLABLE | Set on OTP confirmation |
| `cancelled_at` | TIMESTAMP | NULLABLE | |
| `cancellation_reason` | TEXT | NULLABLE | |
| `wallet_amount_used` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Amount deducted from wallet (if wallet payment) |
| `notes` | TEXT | NULLABLE | Member notes at order time |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Indexes:** `member_id`, `vendor_id`, `status`

---

### 3.7 Table: `order_items`

Line items of each order — product data snapshotted at order time.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `order_id` | UUID | FK → orders.id, CASCADE | |
| `product_id` | UUID | FK → products.id, RESTRICT | |
| `quantity` | INTEGER | NOT NULL, MIN 1 | |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price at time of order |
| `total_price` | DECIMAL(12,2) | NOT NULL | `quantity × unit_price` |
| `product_name` | VARCHAR(200) | NOT NULL | Snapshot — immutable after creation |
| `product_unit` | VARCHAR(30) | NOT NULL | Snapshot — immutable after creation |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Index:** `order_id`

---

### 3.8 Table: `sita_wallet_transactions`

Immutable ledger of all wallet credits and debits.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `member_id` | UUID | FK → members.id, CASCADE | |
| `type` | ENUM | NOT NULL | Values: `credit`, `debit` |
| `amount` | DECIMAL(12,2) | NOT NULL | Always positive; type determines direction |
| `balance_after` | DECIMAL(12,2) | NOT NULL | Member wallet balance after this transaction |
| `reason` | ENUM | NOT NULL | Values: `order_refund`, `dispute_resolution`, `admin_credit`, `order_payment`, `membership_refund` |
| `description` | TEXT | NULLABLE | Human-readable description |
| `order_id` | UUID | FK → orders.id, SET NULL | NULL for admin credits |
| `reference_id` | VARCHAR(100) | NULLABLE | External payment reference (Razorpay order ID, etc.) |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Index:** `member_id`

---

### 3.9 Table: `master_contracts`

Negotiated pricing agreements between a vendor and a specific member for a specific product.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `vendor_id` | UUID | FK → vendors.id, CASCADE | |
| `member_id` | UUID | FK → members.id, CASCADE | |
| `product_id` | UUID | FK → products.id, CASCADE | |
| `negotiated_price` | DECIMAL(10,2) | NOT NULL | Overrides product.price_per_unit for this member |
| `valid_from` | DATE | NOT NULL | |
| `valid_to` | DATE | NOT NULL | |
| `status` | ENUM | NOT NULL, DEFAULT 'active' | Values: `active`, `expired`, `cancelled` |
| `notes` | TEXT | NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 3.10 Table: `disputes`

Formal dispute records raised by members against orders.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `order_id` | UUID | FK → orders.id, CASCADE | |
| `member_id` | UUID | FK → members.id, CASCADE | |
| `vendor_id` | UUID | FK → vendors.id, CASCADE | Denormalized for query performance |
| `reason` | ENUM | NOT NULL | Values: `wrong_item`, `damaged_item`, `short_quantity`, `non_delivery`, `quality_issue`, `overcharged`, `other` |
| `description` | TEXT | NOT NULL | Minimum 20 characters |
| `status` | ENUM | NOT NULL, DEFAULT 'open' | Values: `open`, `investigating`, `resolved`, `rejected` |
| `resolution` | TEXT | NULLABLE | Admin resolution notes |
| `refund_amount` | DECIMAL(12,2) | NULLABLE | Amount refunded if resolved with refund |
| `refund_to_wallet` | BOOLEAN | NOT NULL, DEFAULT false | If true, refund credited to member wallet |
| `resolved_at` | TIMESTAMP | NULLABLE | |
| `resolved_by` | UUID | NULLABLE | Admin ID who resolved |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Indexes:** `order_id`, `member_id`, `status`

---

### 3.11 Table: `survey_entities`

Hospitality establishments profiled by field survey agents.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `agent_id` | VARCHAR(15) | NOT NULL | Phone number of the field agent |
| `entity_name` | VARCHAR(200) | NOT NULL | |
| `owner_name` | VARCHAR(150) | NOT NULL | |
| `mobile` | VARCHAR(15) | NOT NULL | 10-digit validated |
| `entity_type` | ENUM | NOT NULL | Values: `Hotel`, `Restaurant`, `Resort`, `Caterer`, `Annakshetra`, `Temple Kitchen` |
| `address` | TEXT | NOT NULL | |
| `district` | VARCHAR(100) | NOT NULL | |
| `taluka` | VARCHAR(100) | NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Indexes:** `agent_id`, `district`, `entity_type`

---

### 3.12 Table: `consumption_surveys`

Product consumption data collected at survey entities.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT UUIDV4 | |
| `entity_id` | UUID | FK → survey_entities.id, CASCADE | |
| `product_name` | VARCHAR(200) | NOT NULL | |
| `brand` | VARCHAR(150) | NULLABLE | |
| `category` | ENUM | NULLABLE | Values: `Oils`, `Grains`, `Spices`, `Gas`, `Cleaning` |
| `monthly_quantity` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | |
| `annual_quantity` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Auto-calculated: monthly × 12 if not provided |
| `unit` | ENUM | NULLABLE | Values: `Kg`, `Liters`, `Bags`, `Cylinders` |
| `price_per_unit` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Current purchase price |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Indexes:** `entity_id`, `category`

---

## 4. API Endpoints

**Base URL:** `/api/v1`  
**Content-Type:** `application/json`  
**Authentication:** `Authorization: Bearer <jwt_token>` (where required)

### Legend
- `[MEMBER]` — Requires valid member JWT token (`type: 'member'`)
- `[DRIVER]` — Requires valid driver/agent JWT token (`type: 'driver'`)
- `[AGENT]` — Requires valid survey agent JWT token (`type: 'agent'`)
- `[ADMIN]` — Requires valid admin JWT token (`type: 'admin'`)
- `[OPEN]` — No authentication required

---

### 4.1 Authentication Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/send-otp` | [OPEN] | Request OTP for driver/agent login |
| POST | `/auth/verify-otp` | [OPEN] | Verify OTP and receive JWT (driver/agent) |
| POST | `/auth/member/send-otp` | [OPEN] | Request OTP for member login |
| POST | `/auth/member/verify-otp` | [OPEN] | Verify OTP and receive member JWT |
| POST | `/auth/admin/login` | [OPEN] | Admin login with email + password |

#### POST `/auth/send-otp`
```json
Request:  { "phone": "9876543210" }
Response: { "message": "OTP sent successfully" }
```

#### POST `/auth/verify-otp`
```json
Request:  { "phone": "9876543210", "otp": "123456" }
Response: { "token": "<jwt>", "type": "driver" }
```

#### POST `/auth/member/send-otp`
```json
Request:  { "phone": "9876543210" }
Response: { "message": "OTP sent successfully", "expires_in": 600 }
```

#### POST `/auth/member/verify-otp`
```json
Request:  { "phone": "9876543210", "otp": "123456" }
Response: { "token": "<jwt>", "member": { "id", "name", "phone", "status", "membership_paid", "sita_wallet_balance" } }
```

#### POST `/auth/admin/login`
```json
Request:  { "email": "admin@sita.org", "password": "securepassword" }
Response: { "token": "<admin_jwt>", "admin": { "id", "name", "email", "role" } }
```

---

### 4.2 Member Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/members/register` | [OPEN] | Self-register new member |
| GET | `/members/profile` | [MEMBER] | Get authenticated member's profile |
| PUT | `/members/profile` | [MEMBER] | Update member profile |
| POST | `/members/membership/pay` | [MEMBER] | Pay ₹5,000 membership fee |
| GET | `/members/wallet` | [MEMBER] | Get wallet balance + transaction history |
| GET | `/members/orders` | [MEMBER] | Get order history |

#### POST `/members/register`
```json
Request: {
  "name": "Ramesh Patel",
  "phone": "9876543210",
  "hotel_name": "Hotel Sunrise",
  "hotel_address": "MG Road",
  "city": "Surat",
  "state": "Gujarat",
  "pincode": "395001",
  "gstin": "24XXXXX...",
  "email": "ramesh@sunrise.com"
}
Response: { "message": "Registration successful. Pending admin approval.", "member_id": "<uuid>" }
```

#### GET `/members/wallet`
```
Query params: page (default: 1), limit (default: 10)
Response: {
  "balance": 5000.00,
  "transactions": [{ "id", "type", "amount", "balance_after", "reason", "description", "created_at" }],
  "pagination": { "total", "page", "limit", "total_pages" }
}
```

#### GET `/members/orders`
```
Query params: status (optional), page, limit
```

---

### 4.3 Product Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | [MEMBER] | List approved + available products |
| GET | `/products/:id` | [MEMBER] | Get product detail with vendor info |

#### GET `/products`
```
Query params: category, search, min_price, max_price, page, limit
Response: { "products": [...], "pagination": {...} }
```

---

### 4.4 Order Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | [MEMBER] | Place new order |
| GET | `/orders/:id` | [MEMBER] | Get order detail with items + dispute |
| POST | `/orders/:id/dispute` | [MEMBER] | Raise dispute on order |

#### POST `/orders`
```json
Request: {
  "vendor_id": "<uuid>",
  "items": [
    { "product_id": "<uuid>", "quantity": 50 }
  ],
  "delivery_address": "Hotel Sunrise, MG Road, Surat",
  "payment_method": "wallet",
  "notes": "Deliver before 10 AM"
}
Response: {
  "order_number": "SITA-1713000000-ABCD",
  "status": "pending",
  "total_amount": 25000.00,
  "sita_commission": 500.00,
  "vendor_amount": 24500.00
}
```

#### POST `/orders/:id/dispute`
```json
Request: {
  "reason": "damaged_item",
  "description": "Delivered items were broken. Packaging was torn."
}
Response: { "message": "Dispute raised successfully", "dispute_id": "<uuid>" }
```

---

### 4.5 Delivery Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/delivery/orders` | [DRIVER] | List all dispatched orders |
| POST | `/delivery/confirm` | [DRIVER] | Confirm delivery with OTP |
| POST | `/delivery/defect` | [DRIVER] | Report defect / raise dispute |

#### GET `/delivery/orders`
```json
Response: {
  "orders": [{
    "id": "<uuid>",
    "order_number": "SITA-...",
    "member": { "name", "hotel_name", "phone", "hotel_address" },
    "items": [{ "product_name", "quantity", "product_unit" }],
    "total_amount": 25000.00,
    "delivery_address": "..."
  }]
}
```

#### POST `/delivery/confirm`
```json
Request:  { "order_id": "<uuid>", "otp": "482931" }
Response: { "message": "Delivery confirmed successfully", "delivered_at": "2026-04-12T10:30:00Z" }
```

#### POST `/delivery/defect`
```json
Request:  { "order_id": "<uuid>", "description": "Items appear tampered", "photo_url": "https://..." }
Response: { "message": "Defect reported. Dispute created.", "dispute_id": "<uuid>" }
```

---

### 4.6 Survey Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/survey/entity` | [AGENT] | Register new survey entity |
| GET | `/survey/entities` | [AGENT] | List agent's surveyed entities |
| POST | `/survey/consumption` | [AGENT] | Submit consumption survey data |

#### POST `/survey/entity`
```json
Request: {
  "entity_name": "Hotel Galaxy",
  "owner_name": "Suresh Mehta",
  "mobile": "9988776655",
  "entity_type": "Hotel",
  "address": "Station Road, Anand",
  "district": "Anand",
  "taluka": "Anand"
}
Response: { "message": "Entity registered successfully", "entity_id": "<uuid>" }
```

#### POST `/survey/consumption`
```json
Request: {
  "entity_id": "<uuid>",
  "products": [
    {
      "product_name": "Refined Sunflower Oil",
      "brand": "Fortune",
      "category": "Oils",
      "monthly_quantity": 150,
      "unit": "Liters",
      "price_per_unit": 120.00
    }
  ]
}
Response: { "message": "Consumption survey submitted", "records_created": 1 }
```

---

### 4.7 Admin Routes

All admin routes require `[ADMIN]` Bearer token.

#### Dashboard

| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard/stats` | KPIs: member counts, order counts by status, GMV, open disputes |

#### Member Management

| Method | Path | Description |
|---|---|---|
| GET | `/admin/members` | List members. Params: `status`, `city`, `page`, `limit` |
| GET | `/admin/members/:id` | Member detail with orders + wallet history |
| PUT | `/admin/members/:id/approve` | Approve member registration |
| PUT | `/admin/members/:id/reject` | Reject with `{ reason }` |
| PUT | `/admin/members/:id/suspend` | Suspend member |
| POST | `/admin/members/:id/wallet/credit` | Credit wallet: `{ amount, description }` |
| DELETE | `/admin/members/:id` | Delete member record |

#### Vendor Management

| Method | Path | Description |
|---|---|---|
| GET | `/admin/vendors` | List vendors. Params: `status`, `category`, `page`, `limit` |
| GET | `/admin/vendors/:id` | Vendor detail with products |
| POST | `/admin/vendors` | Create vendor directly |
| PUT | `/admin/vendors/:id/approve` | Approve vendor |
| PUT | `/admin/vendors/:id/reject` | Reject with `{ reason }` |
| DELETE | `/admin/vendors/:id` | Delete vendor |

#### Product Management

| Method | Path | Description |
|---|---|---|
| GET | `/admin/products` | List products. Params: `approved`, `vendor_id`, `category`, `page`, `limit` |
| PUT | `/admin/products/:id/approve` | Approve product (makes visible in catalog) |
| PUT | `/admin/products/:id/reject` | Reject product |
| DELETE | `/admin/products/:id` | Delete product |

#### Order Management

| Method | Path | Description |
|---|---|---|
| GET | `/admin/orders` | List all orders. Params: `status`, `member_id`, `vendor_id`, `page`, `limit` |
| GET | `/admin/orders/:id` | Full order detail |
| PUT | `/admin/orders/:id/status` | Update order status: `{ status }` |
| DELETE | `/admin/orders/:id` | Delete order |

#### Dispute Management

| Method | Path | Description |
|---|---|---|
| GET | `/admin/disputes` | List disputes. Params: `status`, `page`, `limit` |
| GET | `/admin/disputes/:id` | Full dispute with related order + items |
| PUT | `/admin/disputes/:id/resolve` | Resolve: `{ resolution, refund_amount, refund_to_wallet }` |
| PUT | `/admin/disputes/:id/reject` | Reject: `{ reason }` |

---

## 5. Business Logic Functions

All utility functions are located in `sita-backend/src/utils/helpers.js`.

### 5.1 Logic A — Revenue Split Calculation

**Function:** `calculateSplit(amount)`

```javascript
/**
 * Splits order total into SITA commission and vendor disbursement.
 * Commission rate is configurable via SITA_COMMISSION_PERCENT env var.
 * 
 * @param {number} amount - Total order value (₹)
 * @returns {{ sita_commission: number, vendor_amount: number }}
 */
const calculateSplit = (amount) => {
  const commissionPercent = parseFloat(process.env.SITA_COMMISSION_PERCENT) || 2;
  const sita_commission = parseFloat((amount * commissionPercent / 100).toFixed(2));
  const vendor_amount   = parseFloat((amount - sita_commission).toFixed(2));
  return { sita_commission, vendor_amount };
};
```

**Rules:**
- Default commission: 2% (env: `SITA_COMMISSION_PERCENT`)
- Both values are rounded to 2 decimal places
- The sum `sita_commission + vendor_amount` always equals `amount` (rounding handled by subtraction, not independent rounding)
- Values are stored immutably at order creation time in `orders.sita_commission` and `orders.vendor_amount`

**Example:**
```
amount = ₹25,000.00
sita_commission = ₹500.00   (2%)
vendor_amount   = ₹24,500.00 (98%)
```

---

### 5.2 Logic B — Membership Gate

**Function:** Inline validation in order route middleware

```javascript
/**
 * Gate condition checked before any order can be placed.
 * Both conditions must be true simultaneously.
 */
const canPlaceOrder = (member) => {
  return member.status === 'active' && member.membership_paid === true;
};
```

**Membership State Transitions:**
```
[Self-Register] → status: 'pending', membership_paid: false
       │
       ▼ (Admin: approve)
status: 'active', membership_paid: false
       │
       ▼ (Member: pay ₹5,000)
status: 'active', membership_paid: true   ← CAN PLACE ORDERS
       │
       ├─ (Admin: suspend) → status: 'suspended'   ← CANNOT PLACE ORDERS
       └─ (Admin: reject)  → status: 'rejected'    ← CANNOT PLACE ORDERS
```

**Membership fee:** `₹5,000` (env: `MEMBERSHIP_FEE`). Non-refundable. Stored in `members.membership_fee` at time of payment.

---

### 5.3 Logic C — SITA Wallet Operations

**Function:** Inline within order and admin routes; uses Sequelize transactions.

#### Wallet Debit (Order Payment via Wallet)
```javascript
/**
 * Executed within DB transaction during order creation.
 * Fails entire order if balance insufficient.
 */
async function debitWallet(member, amount, order, transaction) {
  if (member.sita_wallet_balance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  const balance_after = parseFloat((member.sita_wallet_balance - amount).toFixed(2));
  await member.update({ sita_wallet_balance: balance_after }, { transaction });
  await SitaWalletTransaction.create({
    member_id: member.id,
    type: 'debit',
    amount,
    balance_after,
    reason: 'order_payment',
    order_id: order.id,
    description: `Payment for order ${order.order_number}`
  }, { transaction });
}
```

#### Wallet Credit (Dispute Refund)
```javascript
/**
 * Executed when admin resolves dispute with refund_to_wallet=true.
 */
async function creditWallet(member, amount, order, reason, description) {
  const balance_after = parseFloat((member.sita_wallet_balance + amount).toFixed(2));
  await member.update({ sita_wallet_balance: balance_after });
  await SitaWalletTransaction.create({
    member_id: member.id,
    type: 'credit',
    amount,
    balance_after,
    reason,              // 'dispute_resolution' or 'admin_credit'
    order_id: order?.id,
    description
  });
}
```

**Invariant:** Every change to `members.sita_wallet_balance` must have a corresponding `sita_wallet_transactions` record with the same `balance_after` value.

---

### 5.4 Logic D — OTP Generation & Delivery Confirmation

**Function:** `generateOTP()` and `isOtpValid()` in helpers and Member model.

```javascript
/**
 * Generates a cryptographically adequate 6-digit OTP.
 * @returns {string} 6-digit numeric OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Member model instance method.
 * Checks OTP match and expiry.
 */
Member.prototype.isOtpValid = function(inputOtp) {
  return this.otp === inputOtp && new Date(this.otp_expires_at) > new Date();
};
```

#### Login OTP Flow (Member)
```
1. POST /auth/member/send-otp { phone }
   → generateOTP() → 6-digit code
   → member.otp = code
   → member.otp_expires_at = NOW() + OTP_EXPIRY_MINUTES (default: 10 min)
   → [PRODUCTION] Send SMS via Twilio
   → [DEVELOPMENT] console.log('OTP:', code)

2. POST /auth/member/verify-otp { phone, otp }
   → member.isOtpValid(otp) → true/false
   → If valid: clear member.otp, issue JWT (expires: JWT_EXPIRES_IN)
   → If bypass: OTP_BYPASS env matches input → accept (dev only)
```

#### Delivery OTP Flow
```
1. Order created with status='pending'
   → delivery_otp = generateOTP()
   → Stored in orders.delivery_otp
   → [DEV] Returned in response as dev_delivery_otp
   → [PROD] Displayed in member app on order detail

2. Driver POST /delivery/confirm { order_id, otp }
   → order.delivery_otp === otp → match check
   → order.status = 'delivered'
   → order.delivery_otp_verified = true
   → order.delivered_at = NOW()
```

---

### 5.5 Helper Functions

#### Order Number Generation
```javascript
/**
 * Generates unique order number.
 * Format: SITA-{unix_timestamp}-{4_random_uppercase_alphanumeric}
 * Example: SITA-1713000000-AB3X
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `SITA-${timestamp}-${random}`;
};
```

#### Pagination
```javascript
/**
 * Standardized pagination for all list endpoints.
 * @returns { limit, offset, page } for Sequelize queries
 */
const getPagination = (page = 1, limit = 10) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  return { limit: parseInt(limit), offset, page: parseInt(page) };
};

/**
 * Formats Sequelize count+rows result into pagination metadata.
 */
const formatPaginationResponse = (count, rows, page, limit) => ({
  data: rows,
  pagination: {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    total_pages: Math.ceil(count / limit)
  }
});
```

---

## 6. Security Requirements

### 6.1 Authentication & Authorization

| Requirement | Implementation |
|---|---|
| Member/Driver/Agent Authentication | JWT RS256 or HS256, signed with `JWT_SECRET`. Token contains `{ id, phone, type }`. Expires in `JWT_EXPIRES_IN` (default: 7 days). |
| Admin Authentication | Separate JWT signed with `ADMIN_JWT_SECRET`. Token contains `{ id, email, role, type: 'admin' }`. Expires in `ADMIN_JWT_EXPIRES_IN` (default: 8 hours). |
| Authorization Middleware | `auth.js` middleware validates token, checks token type matches route requirements, attaches `req.user` to request. |
| Role Check | `req.user.type` must equal expected type (`member`, `driver`, `agent`, `admin`) per route. Superadmin role required for destructive admin operations. |
| Token Storage (Mobile) | `shared_preferences` (Flutter) — tokens stored locally on device. |
| Token Storage (Admin) | `localStorage` (React) — admin session token. |

### 6.2 Password Security (Admin)

| Requirement | Implementation |
|---|---|
| Hashing Algorithm | bcryptjs with **salt rounds: 12** |
| Hash Trigger | Sequelize `beforeCreate` and `beforeUpdate` hooks on `Admin` model |
| Plain-text Password | Never stored; only bcrypt hash in `admins.password` |
| Comparison | `bcrypt.compare(plainPassword, storedHash)` on login |

### 6.3 OTP Security

| Requirement | Implementation |
|---|---|
| OTP Length | 6 digits (100000–999999) |
| OTP Expiry | `OTP_EXPIRY_MINUTES` env (default: 10 minutes) |
| OTP Storage | Members: hashed in DB (`members.otp`). Drivers/Agents: in-memory Map (cleared after verification). |
| Bypass Mechanism | `OTP_BYPASS` env var — **must be disabled/removed in production** |
| Rate Limiting | `express-rate-limit` applied globally (recommended: 5 OTP requests per phone per 15 minutes in production) |

### 6.4 Data Encryption

| Requirement | Implementation |
|---|---|
| Transport Encryption | HTTPS / TLS 1.2+ enforced on GCP Load Balancer for all client-server communication |
| Database Encryption at Rest | AES-256 encryption via Cloud SQL encryption (GCP-managed keys) |
| Secret Management | All secrets (JWT keys, DB passwords, API keys) stored in GCP Secret Manager; injected at runtime via environment variables |
| PII Handling | Member phone numbers, hotel addresses stored in PostgreSQL (Cloud SQL) within GCP, subject to data residency in `asia-south1` |

### 6.5 API Security

| Requirement | Implementation |
|---|---|
| Input Validation | `express-validator` on all POST/PUT routes — validates types, lengths, enum values, phone formats |
| SQL Injection Prevention | Sequelize ORM with parameterized queries — no raw SQL string interpolation |
| Rate Limiting | `express-rate-limit` applied globally; adjustable per route in production |
| CORS | Allowlist of specific origins via `cors` middleware; `FRONTEND_URL` env configures allowed origin |
| Helmet.js | Recommended for production — sets security-relevant HTTP headers |
| Error Handling | Centralized `error.js` middleware — no stack traces or internal details exposed in production responses |
| Admin Routes | All `/admin/*` routes protected by separate admin JWT middleware |

### 6.6 Production Security Checklist

- [ ] `OTP_BYPASS` env var removed from production `.env`
- [ ] `NODE_ENV=production` set (enables SSL for DB, suppresses dev OTP logging)
- [ ] All JWT secrets rotated from defaults; minimum 64 random characters each
- [ ] PostgreSQL SSL enabled (`rejectUnauthorized: false` for Cloud SQL)
- [ ] GCP Secret Manager used for all credentials (no secrets in source code)
- [ ] Cloud SQL private IP (not public IP) used in production
- [ ] Cloud Run service account has minimal required IAM permissions
- [ ] `dev_delivery_otp` field removed from production order responses

---

## 7. Deployment Architecture — GCP Mumbai

### 7.1 GCP Services

| Service | GCP Product | Purpose |
|---|---|---|
| App Hosting | Cloud Run | Containerized Node.js backend — auto-scaling, serverless |
| Database | Cloud SQL (PostgreSQL 14) | Managed relational database |
| File Storage | Cloud Storage (GCS) | Product images, documents |
| Secrets | Secret Manager | JWT keys, DB passwords, API keys |
| Container Registry | Artifact Registry | Docker image storage |
| CDN | Cloud CDN | Static asset delivery for admin panel and website |
| Admin Panel Hosting | Cloud Storage + Cloud CDN | Static React build hosting |
| Load Balancer | Cloud Load Balancing | HTTPS termination, routing |
| Monitoring | Cloud Monitoring + Logging | Application metrics, logs, alerts |
| DNS | Cloud DNS | Domain management |

**Region:** `asia-south1` (Mumbai) — selected for data residency and latency to Indian users.

### 7.2 Cloud Run Configuration

```yaml
Service: sita-backend
Image:   asia-south1-docker.pkg.dev/<PROJECT_ID>/sita/sita-backend:latest
Region:  asia-south1

Resources:
  CPU:    1 vCPU (min), 2 vCPU (burst)
  Memory: 512 Mi (min), 2 Gi (max)

Scaling:
  min_instances: 1    # Always-warm for low latency
  max_instances: 10   # Scales to 10x under load
  concurrency:    80  # Requests per instance

Environment:
  - All secrets injected from GCP Secret Manager
  - NODE_ENV=production
```

### 7.3 Cloud SQL Configuration

```
Instance:    sita-postgres
DB Version:  PostgreSQL 14
Tier:        db-f1-micro (development), db-g1-small (staging), db-n1-standard-2 (production)
Region:      asia-south1
Storage:     SSD, 20GB start, auto-resize enabled
Backups:     Daily automated backups, 7-day retention
HA:          Enabled (production) — standby in different zone
SSL:         Required for all connections
Private IP:  Enabled — Cloud Run connects via private VPC
```

### 7.4 CI/CD Pipeline (Recommended)

```
GitHub (main branch)
        │
        ▼ (GitHub Actions on push to main)
[1] Run tests (npm test)
[2] Build Docker image
[3] Push to Artifact Registry
[4] Deploy to Cloud Run (gcloud run deploy)
[5] Run health check on /api/v1/health
[6] Notify team on Slack (success/failure)
```

### 7.5 Environment Configuration

| Variable | Description | Source |
|---|---|---|
| `NODE_ENV` | Runtime environment (`production`) | Cloud Run env |
| `PORT` | Server port (Cloud Run uses 8080 by default) | Cloud Run env |
| `DB_HOST` | Cloud SQL private IP | Secret Manager |
| `DB_PORT` | PostgreSQL port (5432) | Cloud Run env |
| `DB_NAME` | Database name (`sita_foundation`) | Secret Manager |
| `DB_USER` | PostgreSQL user | Secret Manager |
| `DB_PASSWORD` | PostgreSQL password | Secret Manager |
| `JWT_SECRET` | Member/driver/agent JWT signing key (min 64 chars) | Secret Manager |
| `JWT_EXPIRES_IN` | Member token expiry (`7d`) | Cloud Run env |
| `ADMIN_JWT_SECRET` | Admin JWT signing key (min 64 chars) | Secret Manager |
| `ADMIN_JWT_EXPIRES_IN` | Admin token expiry (`8h`) | Cloud Run env |
| `OTP_EXPIRY_MINUTES` | OTP TTL in minutes (`10`) | Cloud Run env |
| `SITA_COMMISSION_PERCENT` | Revenue split commission (`2`) | Cloud Run env |
| `MEMBERSHIP_FEE` | Membership fee in INR (`5000`) | Cloud Run env |
| `FRONTEND_URL` | Admin panel URL (CORS allowlist) | Cloud Run env |
| `RAZORPAY_KEY_ID` | Razorpay API key | Secret Manager |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Secret Manager |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Secret Manager |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Secret Manager |
| `TWILIO_PHONE_NUMBER` | Twilio SMS sender number | Secret Manager |

---

## 8. Performance Requirements

### 8.1 Capacity Targets

| Metric | Requirement |
|---|---|
| Concurrent Users | 10,000 simultaneous active sessions |
| API Throughput | 1,000 requests/second (peak) |
| Response Time (P95) | < 500ms for all read endpoints |
| Response Time (P99) | < 2,000ms for all write endpoints |
| Database Queries | < 100ms average query execution time |
| Uptime SLA | 99.9% (< 8.7 hours downtime/year) |
| Max Payload Size | 10 MB (product images via multipart) |

### 8.2 Scalability Design

| Component | Scaling Strategy |
|---|---|
| **API Server (Cloud Run)** | Horizontal auto-scaling: 1–10 instances based on CPU/request count. Each instance handles 80 concurrent requests. |
| **Database (Cloud SQL)** | Vertical scaling (resize instance). Read replicas for heavy read workloads. Connection pooling via `pg` (pool: max 10 connections per instance). |
| **Static Assets** | Served from Cloud CDN — no compute load on API server |
| **OTP Storage (Drivers)** | In-memory Map (per instance) — must migrate to Redis for multi-instance deployments |
| **Sessions** | Stateless JWT — no session storage required; any instance can validate any token |

### 8.3 Caching Strategy

| Data | Cache Strategy |
|---|---|
| Product catalog | Recommended: Redis TTL cache (5 min) — catalog changes infrequently |
| Member wallet balance | DB-cached column on `members` — updated transactionally |
| Admin dashboard stats | Recommended: Compute on-demand with 60-second TTL cache |
| Static assets (Admin Panel) | Cloud CDN — 1-year cache-control header |

### 8.4 Database Indexing

All foreign keys are indexed by Sequelize automatically. Additional indexes required for performance:

| Table | Column(s) | Reason |
|---|---|---|
| `orders` | `status` | Order list filtering by status |
| `orders` | `member_id` | Member order history |
| `orders` | `vendor_id` | Vendor order history |
| `members` | `phone` | OTP login lookup |
| `members` | `status` | Admin member list filtering |
| `survey_entities` | `agent_id` | Agent's entity list |
| `survey_entities` | `district`, `entity_type` | Market intelligence queries |
| `consumption_surveys` | `entity_id` | Survey lookup by entity |

---

## 9. Third-Party Integrations

### 9.1 Razorpay — Payment Gateway

| Attribute | Detail |
|---|---|
| **Purpose** | Process ₹5,000 membership fee payments; optionally wallet top-ups |
| **Status** | Planned — pre-production launch requirement |
| **Integration Point** | `POST /members/membership/pay` — currently simulated |
| **SDK** | `razorpay` npm package |
| **Flow** | 1. Create Razorpay Order server-side → 2. Return `order_id` to client → 3. Client completes payment in Razorpay checkout → 4. Client sends `payment_id` to server → 5. Server verifies payment signature → 6. Update `membership_paid=true` |
| **Webhook** | Configure Razorpay webhook at `/api/v1/webhooks/razorpay` for payment failure/refund events |
| **Credentials** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` in Secret Manager |

### 9.2 Twilio — SMS OTP Delivery

| Attribute | Detail |
|---|---|
| **Purpose** | Deliver 6-digit OTPs to member, driver, and agent phone numbers via SMS |
| **Status** | Planned — pre-production launch requirement |
| **Integration Point** | `POST /auth/send-otp` and `POST /auth/member/send-otp` — currently console-logged |
| **SDK** | `twilio` npm package |
| **Flow** | 1. Generate OTP → 2. `client.messages.create({ to: '+91' + phone, from: TWILIO_PHONE_NUMBER, body: 'Your SITA OTP is: XXXXXX' })` → 3. Store OTP in DB/memory with expiry |
| **Fallback** | MSG91 or Gupshup as secondary SMS provider if Twilio delivery rate drops |
| **Credentials** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in Secret Manager |

### 9.3 Firebase Cloud Messaging (FCM) — v2

| Attribute | Detail |
|---|---|
| **Purpose** | Push notifications for order status updates, OTP delivery, dispute updates |
| **Status** | Planned for v2 |
| **Integration Point** | Order status change events; dispute resolution |
| **SDK** | `firebase-admin` npm package (server), Firebase SDK in Flutter apps |

### 9.4 Google Maps Platform — v2

| Attribute | Detail |
|---|---|
| **Purpose** | Real-time delivery tracking; delivery address validation and autocomplete |
| **Status** | Planned for v2 |
| **APIs Required** | Maps JavaScript API, Geocoding API, Routes API |
| **Integration Point** | Delivery app (driver location tracking); member app (address autocomplete) |

### 9.5 Google Cloud Vision API — v2

| Attribute | Detail |
|---|---|
| **Purpose** | OCR-based GSTIN and GST certificate verification during vendor onboarding |
| **Status** | Planned for v2 |
| **Integration Point** | Vendor onboarding flow — document upload and verification |

### 9.6 Google Cloud Storage (GCS) — v1

| Attribute | Detail |
|---|---|
| **Purpose** | Store product images uploaded by admin; store delivery defect photos from drivers |
| **Status** | Infrastructure in place; upload API endpoint to be implemented |
| **Bucket** | `sita-foundation-media` in `asia-south1` |
| **Access** | Signed URLs for uploads; public read for product images |
| **SDK** | `@google-cloud/storage` npm package |

---

## 10. Developer Handover Requirements

### 10.1 Repository Structure

```
SITA-Foundation/                       # Root monorepo
├── sita-backend/                      # Node.js Express API
│   ├── src/
│   │   ├── app.js                     # Express app setup, route mounting
│   │   ├── server.js                  # Entry point (node src/server.js)
│   │   ├── config/
│   │   │   └── database.js            # Sequelize + PostgreSQL config
│   │   ├── models/                    # 11 Sequelize model files
│   │   ├── routes/                    # 7 route files (auth, members, products, orders, admin, delivery, survey)
│   │   ├── controllers/               # deliveryController.js, surveyController.js
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verification middleware
│   │   │   └── error.js               # Global error handler
│   │   └── utils/
│   │       └── helpers.js             # OTP, order number, split calc, pagination
│   ├── migrations/                    # 11 Sequelize migration files (run in order)
│   ├── seeders/                       # Admin seed, delivery orders seed
│   ├── .env.example                   # Environment variable template
│   └── package.json
├── sita-admin/                        # React admin panel
│   ├── src/
│   │   ├── App.jsx                    # Routes setup
│   │   ├── pages/                     # DashboardPage, MembersPage, VendorsPage, ProductsPage, OrdersPage, DisputesPage, LoginPage
│   │   ├── context/AuthContext.jsx    # Admin auth state
│   │   ├── services/api.js            # Axios API client
│   │   └── components/               # Shared UI components
│   └── package.json
├── sita-website/                      # Public marketing website (React)
├── sita_member_app/                   # Flutter member app
├── sita_delivery_app/                 # Flutter delivery agent app
├── sita_survey_app/                   # Flutter field survey app
├── assets/                            # Shared logos and assets
├── SETUP.md                           # Local development setup guide
├── SITA_PRD.md                        # Product Requirements Document
└── SITA_TRD.md                        # This document
```

### 10.2 Local Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd SITA-Foundation

# 2. Backend setup
cd sita-backend
npm install
cp .env.example .env
# Edit .env with local PostgreSQL credentials

# 3. Database setup
createdb sita_foundation
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all     # Seeds superadmin + sample data

# 4. Start backend
npm run dev   # nodemon — hot reload on port 3000

# 5. Admin panel
cd ../sita-admin
npm install
npm run dev   # Vite dev server on port 5173

# 6. Flutter apps
cd ../sita_member_app   # (or delivery/survey)
flutter pub get
flutter run
```

**Default Admin Credentials** (from seed):
- Email: `admin@sita.org`
- Password: `Admin@SITA2024`
- Role: `superadmin`

### 10.3 Database Migrations

All schema changes are managed via Sequelize migrations.

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all

# Run specific seed
npx sequelize-cli db:seed --seed 20240101000000-admin-seed.js
```

**Migration files** (run in this order):
1. `create-admins`
2. `create-members`
3. `create-vendors`
4. `create-products`
5. `create-orders`
6. `create-order-items`
7. `create-sita-wallet-transactions`
8. `create-master-contracts`
9. `create-disputes`
10. `create-survey-entities`
11. `create-consumption-surveys`

### 10.4 UAT (User Acceptance Testing) Requirements

Before production sign-off, the following UAT scenarios must be verified and documented:

#### Member Flow
- [ ] Member self-registration and admin approval
- [ ] OTP login on Android device (real SMS)
- [ ] Membership fee payment (Razorpay — real card in test mode)
- [ ] Browse and search product catalog
- [ ] Place order with wallet payment
- [ ] Place order with bank transfer
- [ ] MOQ enforcement (try to order below MOQ — should fail)
- [ ] View order history and order detail
- [ ] Raise dispute with all 7 reason types
- [ ] View wallet balance and transaction history

#### Delivery Agent Flow
- [ ] OTP login on Android device
- [ ] View all dispatched orders
- [ ] Confirm delivery with correct OTP
- [ ] Confirm delivery with incorrect OTP (should fail)
- [ ] Report defect on a dispatched order

#### Survey Agent Flow
- [ ] OTP login on Android device
- [ ] Register new entity (all 6 entity types)
- [ ] Submit consumption survey (multiple products)
- [ ] View previously surveyed entities

#### Admin Flow
- [ ] Admin login with email/password
- [ ] Dashboard KPIs accuracy
- [ ] Approve member, approve vendor, approve product — end-to-end order placement
- [ ] Reject member, reject vendor with reason
- [ ] Suspend member — verify cannot login
- [ ] Manual wallet credit — verify in member app
- [ ] Resolve dispute with wallet refund — verify wallet balance update
- [ ] Reject dispute
- [ ] Update order status manually

#### Non-Functional
- [ ] API response times < 500ms (P95) under normal load
- [ ] 100 concurrent users simulation without 5xx errors
- [ ] OTP expiry (wait 11 minutes — old OTP must fail)
- [ ] JWT expiry (use expired token — must return 401)
- [ ] SQL injection attempt on all text input fields

### 10.5 GitHub Repository Requirements

| Requirement | Detail |
|---|---|
| Repository | Private GitHub repository under SITA Foundation organization |
| Branches | `main` (production), `staging`, `develop` |
| Branch Protection | `main` and `staging` require PR review + CI pass before merge |
| `.gitignore` | Must exclude: `.env`, `node_modules/`, `build/`, `.flutter-plugins`, `*.keystore` |
| Secrets in code | Zero tolerance — all secrets via environment variables |
| README | Each sub-project must have a `README.md` with setup instructions |
| Commit Convention | Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`) |

### 10.6 Production Go-Live Checklist

#### Pre-Launch (Technical)
- [ ] All migrations run on production Cloud SQL
- [ ] `OTP_BYPASS` env var removed
- [ ] `NODE_ENV=production` set on Cloud Run
- [ ] SSL certificate configured on Load Balancer
- [ ] All secrets in GCP Secret Manager (no secrets in Cloud Run env directly)
- [ ] Razorpay integration live-tested with ₹1 test transaction
- [ ] Twilio integration live-tested with real mobile number
- [ ] Cloud SQL daily backups configured
- [ ] Cloud Monitoring alert policies configured (CPU > 80%, 5xx error rate > 1%, DB latency > 500ms)
- [ ] Rate limiting configured per-route (OTP: 5/15min, login: 10/min, orders: 100/hour)
- [ ] Helmet.js added to Express app for security headers
- [ ] CORS allowlist updated to production frontend URL only

#### Pre-Launch (Business)
- [ ] Superadmin credentials changed from seed defaults
- [ ] At least 5 test vendors onboarded with approved products
- [ ] Member onboarding workflow documented for field staff
- [ ] Dispute resolution SLA communicated to ops team
- [ ] Support escalation path defined for disputed deliveries

---

*Document ends. For product requirements and user stories, refer to the SITA Product Requirements Document (SITA_PRD.md).*
