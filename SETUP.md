# SITA Foundation — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

---

## 1. Database Setup

```bash
# Create database in PostgreSQL
psql -U postgres
CREATE DATABASE sita_foundation;
\q
```

---

## 2. Backend Setup

```bash
cd sita-backend

# Copy and edit env
cp .env.example .env
# Edit .env → set DB_USER, DB_PASSWORD

# Install dependencies (already done)
npm install

# Run migrations
npm run db:migrate

# Seed data (creates admin + sample vendors/members/products)
npm run db:seed

# Start server
npm run dev
```

Server runs at: http://localhost:3000

**Default admin credentials:** `admin@sita.org` / `admin123`

---

## 3. Admin Panel Setup

```bash
cd sita-admin

# Install (already done)
npm install

# Start dev server (proxies /api → backend:3000)
npm run dev
```

Admin panel at: http://localhost:5173

Login with `admin@sita.org` / `admin123`

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/member/send-otp | Send OTP to member phone |
| POST | /api/v1/auth/member/verify-otp | Verify OTP, get JWT |
| POST | /api/v1/auth/admin/login | Admin login |

### Members (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/members/register | Self-register |
| GET | /api/v1/members/profile | Own profile |
| PUT | /api/v1/members/profile | Update profile |
| POST | /api/v1/members/membership/pay | Pay membership fee |
| GET | /api/v1/members/wallet | Wallet balance + history |
| GET | /api/v1/members/orders | Own orders |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/products | List approved products |
| GET | /api/v1/products/:id | Product detail |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/orders | Place order (membership required) |
| GET | /api/v1/orders/:id | Order detail |
| POST | /api/v1/orders/:id/dispute | Raise dispute |

### Delivery
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/delivery/verify-otp | Confirm delivery with OTP |
| GET | /api/v1/delivery/order/:order_number | Get order for delivery |

### Admin (requires Admin Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/admin/dashboard/stats | Dashboard stats |
| GET/PUT | /api/v1/admin/members | List, approve, reject |
| GET/PUT/POST | /api/v1/admin/vendors | List, approve, reject, create |
| GET/PUT | /api/v1/admin/products | List, approve, reject |
| GET/PUT | /api/v1/admin/orders | List, update status |
| GET/PUT | /api/v1/admin/disputes | List, resolve, reject |

---

## Business Logic

| Rule | Detail |
|------|--------|
| Revenue split | 98% → Vendor, 2% → SITA Foundation |
| Membership gate | Member must pay ₹5,000 non-refundable fee before ordering |
| Delivery OTP | 6-digit OTP generated per order; delivery agent enters it to confirm |
| SITA Wallet | Dispute refunds credited to wallet; usable for future orders |
| OTP bypass (dev) | Use `123456` as OTP in development |

---

## Dev Notes

- In development, OTP is logged to console AND returned in API response as `dev_otp`
- Set `OTP_BYPASS=123456` in `.env` to use static OTP
- Delivery OTP is logged to console as `[Delivery OTP] Order SITA-XXX → OTP: XXXXXX`
