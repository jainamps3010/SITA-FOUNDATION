# SITA Foundation — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** April 12, 2026  
**Status:** Final — v1 Scope  
**Prepared by:** SITA Foundation Product Team  
**Classification:** Internal / Confidential

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Mission](#2-product-vision--mission)
3. [Target Users](#3-target-users)
4. [Product Modules Overview](#4-product-modules-overview)
5. [Core Features by Module](#5-core-features-by-module)
6. [User Stories](#6-user-stories)
7. [Business Rules](#7-business-rules)
8. [Success Metrics & KPIs](#8-success-metrics--kpis)
9. [Out of Scope — v2 (SITA KAVACH)](#9-out-of-scope--v2-sita-kavach)
10. [Assumptions & Dependencies](#10-assumptions--dependencies)
11. [Glossary](#11-glossary)

---

## 1. Executive Summary

SITA Foundation (Sustainable Integrated Tourism Alliance) is a B2B procurement and market intelligence platform built for the hospitality sector in India. The platform connects independent hoteliers, small resorts, restaurants, and caterers with verified suppliers (vendors), enabling bulk procurement at negotiated prices, transparent order management, and data-driven market insights.

SITA v1 delivers three primary digital products:

| Product | Purpose |
|---|---|
| **SITA Business Terminal** | B2B procurement marketplace — member app, vendor management, delivery confirmation |
| **SITA Market Intelligence** | Field survey platform for demand mapping and consumption data collection |
| **SITA Admin Panel** | Centralized back-office for operations, approvals, dispute resolution, and analytics |

The platform operates on a **2% commission model** — SITA collects 2% of every transaction and disburses 98% to the vendor. Membership is gated behind a non-refundable ₹5,000 onboarding fee, ensuring committed buyers on the platform.

---

## 2. Product Vision & Mission

### Vision
To become the most trusted procurement and intelligence network for the hospitality industry in tier-2 and tier-3 cities of India, enabling small and medium hoteliers to access the same quality and pricing advantages as large hotel chains.

### Mission
- Digitize procurement for independent hoteliers who currently rely on unorganized, fragmented supplier networks.
- Provide vendors with a reliable, technology-enabled sales channel into the hospitality sector.
- Generate actionable market intelligence through structured field surveys to guide supply-side planning.
- Build a transparent, dispute-resilient platform with clear SLAs, OTP-verified deliveries, and a neutral admin arbitration layer.

### Strategic Goals (v1)
1. Onboard 500+ verified hoteliers within 6 months of launch.
2. Onboard 100+ verified vendors across core categories.
3. Process ₹1 Cr+ in monthly GMV (Gross Merchandise Value) within 6 months.
4. Survey 1,000+ hospitality entities for market intelligence.
5. Achieve <24-hour dispute resolution SLA.

---

## 3. Target Users

### 3.1 Members (Hoteliers)

| Attribute | Detail |
|---|---|
| **Who** | Owners or purchasing managers of hotels, resorts, restaurants, banquet halls |
| **Location** | Tier-2 and tier-3 cities, semi-urban hospitality clusters |
| **Tech Comfort** | Moderate — smartphone-first, familiar with WhatsApp and UPI |
| **Pain Points** | Inconsistent supply pricing, no formal procurement system, unreliable vendor relationships |
| **Primary Device** | Android smartphone |
| **Goal** | Browse and order hospitality supplies at fair, consistent prices with delivery confirmation |

### 3.2 Vendors (Suppliers)

| Attribute | Detail |
|---|---|
| **Who** | Manufacturers, distributors, or traders in hospitality supply categories |
| **Categories** | Food & Beverages, Housekeeping, Linen & Laundry, Amenities, Equipment, Technology, Furniture |
| **Tech Comfort** | Low-to-moderate — admin manages their product catalog |
| **Pain Points** | Reaching hospitality buyers, collections, order management |
| **Goal** | Expand B2B sales channel with guaranteed payment terms |

### 3.3 Delivery Agents (Drivers)

| Attribute | Detail |
|---|---|
| **Who** | Vendor-side or third-party delivery personnel |
| **Tech Comfort** | Low — needs a minimal, single-purpose app |
| **Pain Points** | No proof of delivery, disputed deliveries |
| **Primary Device** | Android smartphone |
| **Goal** | Confirm deliveries securely via OTP, report defects in real time |

### 3.4 Field Survey Agents

| Attribute | Detail |
|---|---|
| **Who** | SITA Foundation field staff assigned to survey hospitality entities |
| **Tech Comfort** | Low-to-moderate |
| **Pain Points** | Paper-based data collection, no structured format |
| **Primary Device** | Android smartphone |
| **Goal** | Digitally capture entity profiles and consumption survey data |

### 3.5 Admins

| Attribute | Detail |
|---|---|
| **Who** | SITA Foundation operations and compliance staff |
| **Roles** | Superadmin (full access), Admin (operations) |
| **Primary Device** | Desktop/laptop browser |
| **Goal** | Manage onboarding approvals, monitor orders, resolve disputes, access analytics |

---

## 4. Product Modules Overview

```
SITA Foundation Platform
│
├── SITA Business Terminal
│   ├── Member App (Flutter — Android/iOS)
│   ├── Admin Panel (React — Web)
│   └── Delivery App (Flutter — Android)
│
└── SITA Market Intelligence
    └── Survey App (Flutter — Android)
```

---

## 5. Core Features by Module

### 5.1 SITA Business Terminal — Member App

#### 5.1.1 Authentication
- **OTP-based login** — Member enters their registered mobile number, receives a 6-digit OTP via SMS, and is authenticated with a JWT session token.
- No password required; phone number is the primary identity.
- OTP expires in 10 minutes.
- New members can self-register and await admin approval.

#### 5.1.2 Membership Onboarding
- Self-registration form capturing: name, hotel name, address, city, state, pincode, GSTIN (optional), email.
- Initial status is `pending` — awaiting admin review and approval.
- Once approved, member must pay a **non-refundable ₹5,000 membership fee** to activate full marketplace access.
- Members can view their profile and wallet balance but cannot place orders until membership is activated.

#### 5.1.3 Product Catalog
- Browse all admin-approved, vendor-active products.
- Filter by category: Food & Beverages, Housekeeping, Linen & Laundry, Amenities, Equipment, Technology, Furniture.
- Search by product name or keyword.
- Filter by price range.
- View product detail: name, description, category, unit, price per unit, minimum order quantity (MOQ), vendor name.

#### 5.1.4 Order Management
- Add products to cart; system enforces MOQ per item.
- Select payment method: SITA Wallet, Bank Transfer, UPI, or Cash.
- Provide delivery address.
- Submit order — order number generated in format `SITA-{timestamp}-{random}`.
- Track order status: Pending → Confirmed → Dispatched → Delivered.
- View order history with line items, amounts, and status.
- Raise a dispute on any delivered or dispatched order.

#### 5.1.5 SITA Wallet
- View current wallet balance.
- View full transaction history (paginated): credits and debits with timestamps, amounts, and reasons.
- Wallet is credited by admin (manual top-up) or dispute refunds.
- Wallet can be used as a payment method at checkout.

#### 5.1.6 Dispute Management
- Raise a dispute on any order in `delivered`, `confirmed`, or `dispatched` status.
- Specify reason: Wrong Item, Damaged Item, Short Quantity, Non-Delivery, Quality Issue, Overcharged, Other.
- Provide a description (minimum 20 characters).
- Dispute status visible in order detail: Open, Investigating, Resolved, Rejected.

---

### 5.2 SITA Business Terminal — Admin Panel

#### 5.2.1 Dashboard
- KPI cards: Total Members (active, pending), Total Vendors, Total Orders (by status), Total GMV, Total Disputes (open).
- Recent orders table with quick-action links.
- Real-time counts of pending approvals (members, vendors, products).

#### 5.2.2 Member Management
- List all members with filters: status, city, membership paid.
- Member detail view: profile, membership status, wallet balance, full order history, wallet transactions.
- Actions: Approve, Reject (with reason), Suspend, Delete.
- Manual wallet credit with description and reason.

#### 5.2.3 Vendor Management
- List all vendors with filters: status, category.
- Vendor detail view: company info, GST, bank details, product list.
- Actions: Approve, Reject (with reason), Delete.
- Create new vendor directly from admin panel.

#### 5.2.4 Product Management
- List all products with filters: approval status, vendor, category.
- Actions: Approve product (makes it visible to members), Reject product, Delete product.

#### 5.2.5 Order Management
- List all orders across all members and vendors.
- Filters: status, date range, member, vendor.
- Order detail: full item list, member info, vendor info, payment breakdown, delivery OTP status, dispute (if any).
- Update order status manually (for backend operations).

#### 5.2.6 Dispute Management
- List all disputes with filters: status, date range.
- Dispute detail: full order context, member claim, vendor info.
- Resolve dispute: enter resolution text, optionally specify refund amount and whether to credit member wallet.
- Reject dispute: enter rejection reason.

---

### 5.3 SITA Business Terminal — Delivery App

#### 5.3.1 Authentication
- Driver logs in with registered mobile number via OTP.
- Separate JWT session from member tokens; driver type flagged in token payload.

#### 5.3.2 Dispatched Orders View
- Lists all orders currently in `dispatched` status.
- Each card shows: Order number, Member name, Hotel name, Member phone, Delivery address, Total amount, Item count.

#### 5.3.3 OTP Delivery Confirmation
- Driver enters the 6-digit Delivery OTP provided by the member at the point of delivery.
- On successful OTP match: order status updates to `delivered`, `delivery_otp_verified` flagged true, `delivered_at` timestamp recorded.
- Failed OTP attempt shows error; driver must retry or contact support.

#### 5.3.4 Defect / Issue Reporting
- Driver can report a defect or issue against any dispatched order.
- Enter description of the problem (optional photo URL).
- System creates a dispute with reason `other` and updates order status to `disputed`.

---

### 5.4 SITA Market Intelligence — Survey App

#### 5.4.1 Authentication
- Field agent logs in with registered mobile number via OTP.
- Same OTP flow as delivery app; agent type flagged in token.

#### 5.4.2 Entity Registration
- Agent creates a new hospitality entity profile with:
  - Entity Name, Owner Name, Mobile Number (10 digits), Entity Type
  - Full Address, District, Taluka
- Entity types: Hotel, Restaurant, Resort, Caterer, Annakshetra, Temple Kitchen.
- Agent ID is auto-attached from authentication token — no manual entry.

#### 5.4.3 Consumption Survey
- For each registered entity, agent can submit a consumption survey.
- For each product consumed:
  - Product name, Brand (optional), Category, Monthly Quantity, Unit, Price per Unit.
  - Annual quantity is auto-calculated as Monthly × 12 if not provided.
- Categories: Oils, Grains, Spices, Gas, Cleaning.
- Units: Kg, Liters, Bags, Cylinders.
- Multiple products can be submitted in a single survey session (bulk create).

#### 5.4.4 Entity History
- Agent can view a list of all entities they have previously registered.
- Serves as a field record of completed visits.

---

## 6. User Stories

### 6.1 Member (Hotelier) Stories

| ID | As a member, I want to... | So that... | Priority |
|---|---|---|---|
| M-01 | Register my hotel on the SITA platform | I can apply for membership | Must Have |
| M-02 | Receive an OTP on my mobile to log in | I don't need to remember a password | Must Have |
| M-03 | Pay my ₹5,000 membership fee | I can unlock full marketplace access | Must Have |
| M-04 | Browse the product catalog by category | I can find products relevant to my hotel | Must Have |
| M-05 | Search for products by name | I can quickly find specific items | Must Have |
| M-06 | See product price, unit, and MOQ before ordering | I know exactly what I'm committing to | Must Have |
| M-07 | Add products to a cart and place an order | I can procure supplies in a single workflow | Must Have |
| M-08 | Pay using my SITA Wallet balance | I can use platform credits for purchases | Must Have |
| M-09 | Receive a delivery OTP for each order | I can use it to confirm receipt with the driver | Must Have |
| M-10 | Track the status of my orders | I know when to expect delivery | Must Have |
| M-11 | Raise a dispute on a problematic order | I have a formal channel for redressal | Must Have |
| M-12 | View my wallet balance and transaction history | I can track my credits and spending | Must Have |
| M-13 | Update my hotel profile details | My information stays accurate | Should Have |
| M-14 | View negotiated contract prices for specific vendors | I benefit from pre-agreed pricing | Should Have |

### 6.2 Delivery Agent Stories

| ID | As a delivery agent, I want to... | So that... | Priority |
|---|---|---|---|
| D-01 | Log in with my mobile number via OTP | I can access my delivery queue securely | Must Have |
| D-02 | See all orders dispatched for delivery | I know which deliveries to make | Must Have |
| D-03 | Confirm delivery by entering the member's OTP | There is a verifiable proof of delivery | Must Have |
| D-04 | Report a defect or problem with an order | Issues are flagged before I leave the delivery site | Must Have |
| D-05 | See member's hotel address and phone | I can navigate to the delivery location | Must Have |

### 6.3 Field Survey Agent Stories

| ID | As a field agent, I want to... | So that... | Priority |
|---|---|---|---|
| S-01 | Log in with my mobile number via OTP | I can access the survey tool securely | Must Have |
| S-02 | Register a new hospitality entity on the platform | The entity is captured in the database | Must Have |
| S-03 | Submit a consumption survey for an entity | SITA Foundation has procurement data for that entity | Must Have |
| S-04 | Submit multiple products in one survey session | I don't need to re-submit for each product | Must Have |
| S-05 | View the list of entities I've already surveyed | I can track my field coverage | Must Have |
| S-06 | Record monthly quantity; have annual quantity auto-calculated | I don't have to manually compute annual figures | Should Have |

### 6.4 Admin Stories

| ID | As an admin, I want to... | So that... | Priority |
|---|---|---|---|
| A-01 | Log in with email and password | I can access the admin panel securely | Must Have |
| A-02 | See a dashboard with key KPIs | I have an at-a-glance view of platform health | Must Have |
| A-03 | Approve or reject member registrations | Only verified hoteliers access the marketplace | Must Have |
| A-04 | Approve or reject vendor onboarding requests | Only trusted suppliers are listed | Must Have |
| A-05 | Approve or reject product listings | Only appropriate products appear in the catalog | Must Have |
| A-06 | Manually credit a member's SITA Wallet | I can issue credits for promotions or resolutions | Must Have |
| A-07 | View and update order statuses | I can manage the order lifecycle from the back office | Must Have |
| A-08 | Resolve a dispute with or without a wallet refund | Members are compensated fairly for legitimate claims | Must Have |
| A-09 | Reject a dispute with a reason | Fraudulent or unsubstantiated claims are closed | Must Have |
| A-10 | Suspend a member or vendor account | Non-compliant parties can be blocked quickly | Must Have |
| A-11 | Delete member, vendor, or product records | I can clean up test or erroneous data | Should Have |
| A-12 | Create vendor accounts directly | I can onboard strategic vendors without self-registration | Should Have |

---

## 7. Business Rules

### 7.1 Revenue Split (Logic A)
- Every order total is split at the time of order creation.
- **SITA Commission:** 2% of total order value (configurable via `SITA_COMMISSION_PERCENT` environment variable).
- **Vendor Amount:** 98% of total order value.
- Both amounts are stored immutably on the order record at creation time.
- The commission rate cannot be changed retroactively on existing orders.

### 7.2 Membership Rules (Logic B)
- **Registration:** Any hotelier can self-register; status defaults to `pending`.
- **Admin Approval:** An admin must explicitly approve a registration before the member can pay the membership fee.
- **Membership Fee:** ₹5,000 (configurable via `MEMBERSHIP_FEE` environment variable). Payable once.
- **Non-Refundable:** The membership fee is **non-refundable** under any circumstances, including if the member later decides not to use the platform.
- **Ordering Gate:** A member must have both `status = 'active'` AND `membership_paid = true` to place any order. Either condition alone is insufficient.
- **Suspension:** Admin can suspend a member at any time. A suspended member cannot log in or place orders.

### 7.3 SITA Wallet Rules (Logic C)
- Wallet credits are issued only by:
  1. Admin manual credit (for promotions, onboarding incentives, or compensation).
  2. Dispute resolution refund (when admin resolves a dispute with `refund_to_wallet = true`).
- Wallet debits occur only when `payment_method = 'wallet'` is selected at checkout.
- If wallet balance is insufficient for the full order amount, the order is rejected — partial wallet usage combined with another payment method is **not supported in v1**.
- Every wallet credit and debit creates an immutable `sita_wallet_transactions` record.
- Wallet balance is always recalculated from transaction history; the balance on the `members` table is a cached value updated at every transaction.

### 7.4 OTP Delivery Confirmation (Logic D)
- Every order that reaches `dispatched` status has a unique 6-digit Delivery OTP stored in `orders.delivery_otp`.
- The OTP is communicated to the member through the member app on the order detail screen.
- Delivery confirmation requires the driver to enter this exact OTP via the Delivery App.
- On successful OTP verification: `delivery_otp_verified = true`, `status = 'delivered'`, `delivered_at = NOW()`.
- The Delivery OTP does **not** expire — it remains valid until the order is delivered or cancelled.
- A driver cannot confirm delivery without the correct OTP — this prevents false delivery confirmations.

### 7.5 Order Lifecycle Rules
- Orders follow a strict state machine: `pending` → `confirmed` → `dispatched` → `delivered`.
- An order can transition to `disputed` from `delivered`, `confirmed`, or `dispatched`.
- An order can be `cancelled` from `pending` or `confirmed` status.
- Once `delivered`, an order cannot be cancelled — only disputed.
- Product name and unit are snapshotted into `order_items` at order creation time; vendor price changes do not affect existing orders.
- Minimum Order Quantity (MOQ) is enforced per product at checkout.

### 7.6 Vendor & Product Rules
- Vendors must be approved by admin before their products are visible to members.
- Products must be individually approved by admin before they appear in the product catalog.
- A product belongs to exactly one vendor; products from different vendors cannot be mixed in a single order.
- Vendor bank details (account number, IFSC, account name) are stored for payment disbursement reference.

### 7.7 Dispute Rules
- A member can raise at most one dispute per order.
- Disputes can only be raised on orders in `delivered`, `confirmed`, or `dispatched` status.
- Once a dispute is raised, the order status is set to `disputed` and cannot be changed by the member.
- Admin resolves disputes with one of two outcomes: Resolved (with optional wallet refund) or Rejected.
- If resolved with a refund, `refund_amount` and `refund_to_wallet` fields are set; wallet is credited accordingly.
- Resolved disputes update the order status back to `delivered`.

### 7.8 Survey Rules
- Field agents are authenticated via OTP using the same backend as drivers.
- An agent's phone number serves as their `agent_id` — auto-populated from their JWT token.
- One entity can have multiple consumption surveys submitted over time (repeated visits).
- Annual quantity defaults to `monthly_quantity × 12` if not explicitly provided.

---

## 8. Success Metrics & KPIs

### 8.1 Growth Metrics

| KPI | Definition | Target (6 months post-launch) |
|---|---|---|
| Total Active Members | Members with `status='active'` and `membership_paid=true` | 500 |
| Total Active Vendors | Vendors with `status='active'` | 100 |
| Total Approved Products | Products with `approved=true` and `available=true` | 1,000 |
| Survey Entities Captured | Rows in `survey_entities` | 1,000 |

### 8.2 Transaction Metrics

| KPI | Definition | Target (Monthly, Month 6) |
|---|---|---|
| Gross Merchandise Value (GMV) | Sum of `orders.total_amount` for delivered orders | ₹1,00,00,000 |
| SITA Platform Revenue | Sum of `orders.sita_commission` for delivered orders | ₹2,00,000 (2% of GMV) |
| Order Volume | Count of orders with status `delivered` | 500/month |
| Average Order Value (AOV) | GMV / Order Volume | ₹20,000 |
| Wallet Utilization Rate | Orders paid via wallet / Total orders | >20% |

### 8.3 Operational Metrics

| KPI | Definition | Target |
|---|---|---|
| Member Approval TAT | Time from registration to admin approval | <24 hours |
| Vendor Approval TAT | Time from vendor application to approval | <48 hours |
| Dispute Resolution TAT | Time from dispute raised to admin resolution | <24 hours |
| OTP Delivery Success Rate | OTPs successfully delivered / OTPs sent | >99% |
| Delivery OTP Confirmation Rate | Orders confirmed via OTP / Dispatched orders | >95% |

### 8.4 Quality Metrics

| KPI | Definition | Target |
|---|---|---|
| Dispute Rate | Orders with disputes / Total delivered orders | <3% |
| Member Churn Rate | Members not ordering in 60 days / Active members | <10%/month |
| Order Cancellation Rate | Cancelled orders / Total placed orders | <5% |

---

## 9. Out of Scope — v2 (SITA KAVACH)

The following features are planned for SITA v2 under the **SITA KAVACH** initiative and are explicitly excluded from v1 scope:

| Feature | Description |
|---|---|
| **Insurance Integration** | Product liability and delivery insurance for orders above a threshold value |
| **KAVACH Credit Line** | Embedded working capital finance for members to purchase on credit |
| **Automated Vendor Disbursements** | Real-time automated payout to vendors via Razorpay Route or similar |
| **Buyer Rating System** | Members can rate vendors; vendors can flag unreliable buyers |
| **Vendor Self-Portal** | Vendors manage their own product catalog and order fulfillment via a dedicated web portal |
| **Real-Time Delivery Tracking** | GPS-based live tracking of delivery agents via Google Maps |
| **Push Notifications** | Firebase-powered order status, OTP, and dispute notifications |
| **Demand Forecasting** | ML-based demand prediction using survey consumption data |
| **Multi-Language Support** | Platform UI in Hindi and regional languages |
| **Loyalty & Rewards** | Points-based rewards program for members on repeat purchases |
| **Inventory Management** | Vendor-side stock tracking and low-inventory alerts |
| **GST-Compliant Invoicing** | Auto-generated GST invoices for every order |
| **Bulk Import Tools** | CSV/Excel import for vendor product catalogs |
| **Advanced Analytics** | Cohort analysis, retention funnels, category-level revenue breakdown |
| **SITA KAVACH Mobile App** | Dedicated risk and insurance management app for members |

---

## 10. Assumptions & Dependencies

### Assumptions
1. All members have Android smartphones with internet connectivity.
2. All members have a valid Indian mobile number for OTP authentication.
3. Vendors do not require a self-service portal in v1 — admin manages vendor data.
4. Delivery agents are either vendor-employed or SITA-assigned; they are onboarded by admin.
5. The ₹5,000 membership fee payment integration with a payment gateway (Razorpay) will be completed before production launch.
6. SMS gateway (Twilio or MSG91) will be integrated before production launch; OTP is currently console-logged in development.
7. SITA Foundation staff will handle first-level vendor disbursements manually using the vendor amount data on each order.

### Dependencies

| Dependency | Type | Status |
|---|---|---|
| Razorpay Payment Gateway | External API | Planned — pre-launch |
| Twilio / MSG91 SMS Gateway | External API | Planned — pre-launch |
| Firebase Cloud Messaging | External Service | v2 |
| Google Maps Platform | External API | v2 |
| Google Vision API | External API | v2 |
| GCP Mumbai Region Infrastructure | Cloud | v1 deployment |

---

## 11. Glossary

| Term | Definition |
|---|---|
| **GMV** | Gross Merchandise Value — total value of all orders placed through the platform |
| **MOQ** | Minimum Order Quantity — the minimum number of units required per product in an order |
| **SITA Wallet** | A platform-issued credit balance usable for purchases; funded by admin credits and dispute refunds |
| **Delivery OTP** | A one-time 6-digit code generated per order for delivery confirmation by the driver |
| **SITA Commission** | 2% platform fee deducted from each order's total amount |
| **Vendor Amount** | 98% of order total disbursed to the vendor |
| **Membership Fee** | A non-refundable ₹5,000 onboarding fee paid by a member to activate marketplace access |
| **Survey Entity** | A hospitality establishment (hotel, restaurant, etc.) profiled by a field survey agent |
| **Consumption Survey** | A structured data collection of monthly product consumption at a survey entity |
| **Master Contract** | A negotiated pricing agreement between a specific vendor, member, and product |
| **Dispute** | A formal complaint raised by a member against an order — resolved by admin arbitration |
| **SITA KAVACH** | The v2 product initiative covering insurance, credit, and advanced risk management features |

---

*Document ends. For technical implementation details, refer to the SITA Technical Requirements Document (SITA_TRD.md).*
