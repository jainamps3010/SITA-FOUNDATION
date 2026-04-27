--
-- PostgreSQL database dump
--

\restrict XzrdOgjZFeFWthEqN7qt1Q62kALRpDldJwMHymRY3Yq9hz5012vTlTRVfIdhaOy

-- Dumped from database version 15.17 (Homebrew)
-- Dumped by pg_dump version 15.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_admins_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_admins_role AS ENUM (
    'superadmin',
    'admin'
);


ALTER TYPE public.enum_admins_role OWNER TO postgres;

--
-- Name: enum_consumption_surveys_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_consumption_surveys_category AS ENUM (
    'Oils',
    'Grains',
    'Spices',
    'Gas',
    'Cleaning'
);


ALTER TYPE public.enum_consumption_surveys_category OWNER TO postgres;

--
-- Name: enum_consumption_surveys_unit; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_consumption_surveys_unit AS ENUM (
    'Kg',
    'Liters',
    'Bags',
    'Cylinders'
);


ALTER TYPE public.enum_consumption_surveys_unit OWNER TO postgres;

--
-- Name: enum_disputes_reason; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_disputes_reason AS ENUM (
    'wrong_item',
    'damaged_item',
    'short_quantity',
    'non_delivery',
    'quality_issue',
    'overcharged',
    'other'
);


ALTER TYPE public.enum_disputes_reason OWNER TO postgres;

--
-- Name: enum_disputes_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_disputes_status AS ENUM (
    'open',
    'investigating',
    'resolved',
    'rejected',
    'reviewed'
);


ALTER TYPE public.enum_disputes_status OWNER TO postgres;

--
-- Name: enum_disputes_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_disputes_type AS ENUM (
    'dispute',
    'feedback'
);


ALTER TYPE public.enum_disputes_type OWNER TO postgres;

--
-- Name: enum_master_contracts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_master_contracts_status AS ENUM (
    'active',
    'expired',
    'cancelled'
);


ALTER TYPE public.enum_master_contracts_status OWNER TO postgres;

--
-- Name: enum_members_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_members_category AS ENUM (
    'hotels_restaurants',
    'caterers',
    'religious_annkshetra',
    'bhojan_shala',
    'tea_post_cafe',
    'ngo_charitable'
);


ALTER TYPE public.enum_members_category OWNER TO postgres;

--
-- Name: enum_members_membership_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_members_membership_status AS ENUM (
    'active',
    'expired',
    'cancelled',
    'pending'
);


ALTER TYPE public.enum_members_membership_status OWNER TO postgres;

--
-- Name: enum_members_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_members_payment_status AS ENUM (
    'not_paid',
    'pending_verification',
    'verified',
    'rejected'
);


ALTER TYPE public.enum_members_payment_status OWNER TO postgres;

--
-- Name: enum_members_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_members_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'rejected'
);


ALTER TYPE public.enum_members_status OWNER TO postgres;

--
-- Name: enum_orders_payment_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_orders_payment_method AS ENUM (
    'wallet',
    'bank_transfer',
    'upi',
    'cash'
);


ALTER TYPE public.enum_orders_payment_method OWNER TO postgres;

--
-- Name: enum_orders_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_orders_payment_status AS ENUM (
    'pending',
    'paid',
    'refunded'
);


ALTER TYPE public.enum_orders_payment_status OWNER TO postgres;

--
-- Name: enum_orders_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_orders_status AS ENUM (
    'pending',
    'confirmed',
    'dispatched',
    'delivered',
    'cancelled',
    'disputed'
);


ALTER TYPE public.enum_orders_status OWNER TO postgres;

--
-- Name: enum_products_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_products_category AS ENUM (
    'food_beverages',
    'housekeeping',
    'linen_laundry',
    'amenities',
    'equipment',
    'technology',
    'furniture',
    'other',
    'oils',
    'grains',
    'spices',
    'gas',
    'cleaning_supplies'
);


ALTER TYPE public.enum_products_category OWNER TO postgres;

--
-- Name: enum_sita_wallet_transactions_reason; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_sita_wallet_transactions_reason AS ENUM (
    'order_refund',
    'dispute_resolution',
    'admin_credit',
    'order_payment',
    'membership_refund',
    'admin_debit'
);


ALTER TYPE public.enum_sita_wallet_transactions_reason OWNER TO postgres;

--
-- Name: enum_sita_wallet_transactions_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_sita_wallet_transactions_type AS ENUM (
    'credit',
    'debit'
);


ALTER TYPE public.enum_sita_wallet_transactions_type OWNER TO postgres;

--
-- Name: enum_survey_agents_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_survey_agents_status AS ENUM (
    'approved',
    'blocked'
);


ALTER TYPE public.enum_survey_agents_status OWNER TO postgres;

--
-- Name: enum_survey_entities_entity_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_survey_entities_entity_type AS ENUM (
    'Hotel',
    'Restaurant',
    'Resort',
    'Caterer',
    'Annakshetra',
    'Temple Kitchen'
);


ALTER TYPE public.enum_survey_entities_entity_type OWNER TO postgres;

--
-- Name: enum_vendors_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_vendors_category AS ENUM (
    'food_beverages',
    'housekeeping',
    'linen_laundry',
    'amenities',
    'equipment',
    'technology',
    'furniture',
    'other'
);


ALTER TYPE public.enum_vendors_category OWNER TO postgres;

--
-- Name: enum_vendors_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_vendors_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'rejected'
);


ALTER TYPE public.enum_vendors_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    role public.enum_admins_role DEFAULT 'admin'::public.enum_admins_role,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: consumption_surveys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumption_surveys (
    id uuid NOT NULL,
    entity_id uuid NOT NULL,
    product_name character varying(200) NOT NULL,
    brand character varying(150),
    category public.enum_consumption_surveys_category NOT NULL,
    monthly_quantity numeric(10,2) DEFAULT 0 NOT NULL,
    annual_quantity numeric(10,2) DEFAULT 0 NOT NULL,
    unit public.enum_consumption_surveys_unit NOT NULL,
    price_per_unit numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    invoice_photo_url character varying(255)
);


ALTER TABLE public.consumption_surveys OWNER TO postgres;

--
-- Name: disputes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disputes (
    id uuid NOT NULL,
    order_id uuid,
    member_id uuid NOT NULL,
    vendor_id uuid,
    reason public.enum_disputes_reason,
    description text NOT NULL,
    status public.enum_disputes_status DEFAULT 'open'::public.enum_disputes_status,
    resolution text,
    refund_amount numeric(12,2),
    refund_to_wallet boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    type public.enum_disputes_type DEFAULT 'dispute'::public.enum_disputes_type NOT NULL,
    category character varying(255),
    rating integer
);


ALTER TABLE public.disputes OWNER TO postgres;

--
-- Name: master_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_contracts (
    id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    member_id uuid NOT NULL,
    product_id uuid NOT NULL,
    negotiated_price numeric(10,2) NOT NULL,
    valid_from date NOT NULL,
    valid_to date NOT NULL,
    status public.enum_master_contracts_status DEFAULT 'active'::public.enum_master_contracts_status,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.master_contracts OWNER TO postgres;

--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150),
    phone character varying(15) NOT NULL,
    hotel_name character varying(200) NOT NULL,
    hotel_address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    gstin character varying(20),
    status public.enum_members_status DEFAULT 'pending'::public.enum_members_status,
    membership_paid boolean DEFAULT false,
    membership_fee numeric(10,2) DEFAULT 0,
    membership_paid_at timestamp with time zone,
    sita_wallet_balance numeric(12,2) DEFAULT 0,
    otp character varying(6),
    otp_expires_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    membership_active boolean DEFAULT true NOT NULL,
    category public.enum_members_category,
    gst_number character varying(20),
    business_reg_certificate_url character varying(500),
    fssai_license_url character varying(500),
    establishment_front_photo_url character varying(500),
    billing_counter_photo_url character varying(500),
    kitchen_photo_url character varying(500),
    menu_card_photo_url character varying(500),
    latitude numeric(10,7),
    longitude numeric(10,7),
    district character varying(100),
    geo_timestamp timestamp with time zone,
    membership_start_date date,
    membership_expiry_date date,
    membership_status public.enum_members_membership_status DEFAULT 'pending'::public.enum_members_membership_status NOT NULL,
    utr_number character varying(50),
    payment_submitted_at timestamp with time zone,
    payment_verified_by uuid,
    payment_verified_at timestamp with time zone,
    payment_status public.enum_members_payment_status DEFAULT 'not_paid'::public.enum_members_payment_status NOT NULL,
    payment_rejection_reason text
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    product_name character varying(200) NOT NULL,
    product_unit character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    order_number character varying(20) NOT NULL,
    member_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    status public.enum_orders_status DEFAULT 'pending'::public.enum_orders_status,
    total_amount numeric(12,2) NOT NULL,
    sita_commission numeric(12,2) NOT NULL,
    vendor_amount numeric(12,2) NOT NULL,
    payment_method public.enum_orders_payment_method DEFAULT 'bank_transfer'::public.enum_orders_payment_method,
    payment_status public.enum_orders_payment_status DEFAULT 'pending'::public.enum_orders_payment_status,
    delivery_otp character varying(6),
    delivery_otp_verified boolean DEFAULT false,
    delivery_address text,
    expected_delivery_date date,
    delivered_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    wallet_amount_used numeric(12,2) DEFAULT 0,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    category public.enum_products_category NOT NULL,
    unit character varying(30) NOT NULL,
    price_per_unit numeric(10,2) NOT NULL,
    moq integer DEFAULT 1,
    available boolean DEFAULT true,
    approved boolean DEFAULT false,
    image_url character varying(500),
    sku character varying(50),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    market_price numeric(10,2) DEFAULT NULL::numeric,
    stock_quantity integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: sita_wallet_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sita_wallet_transactions (
    id uuid NOT NULL,
    member_id uuid NOT NULL,
    type public.enum_sita_wallet_transactions_type NOT NULL,
    amount numeric(12,2) NOT NULL,
    balance_after numeric(12,2) NOT NULL,
    reason public.enum_sita_wallet_transactions_reason NOT NULL,
    description text,
    order_id uuid,
    reference_id character varying(100),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sita_wallet_transactions OWNER TO postgres;

--
-- Name: survey_agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_agents (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    mobile character varying(255) NOT NULL,
    district character varying(255),
    taluka character varying(255),
    status public.enum_survey_agents_status DEFAULT 'approved'::public.enum_survey_agents_status,
    total_surveys integer DEFAULT 0,
    last_survey_at timestamp with time zone,
    added_by uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.survey_agents OWNER TO postgres;

--
-- Name: survey_entities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_entities (
    id uuid NOT NULL,
    agent_id character varying(15) NOT NULL,
    entity_name character varying(200) NOT NULL,
    owner_name character varying(150) NOT NULL,
    mobile character varying(15) NOT NULL,
    entity_type public.enum_survey_entities_entity_type NOT NULL,
    address text NOT NULL,
    district character varying(100) NOT NULL,
    taluka character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.survey_entities OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(15) NOT NULL,
    company_name character varying(200) NOT NULL,
    gstin character varying(20),
    category public.enum_vendors_category NOT NULL,
    description text,
    address text,
    city character varying(100),
    state character varying(100),
    bank_account_number character varying(30),
    bank_ifsc character varying(15),
    bank_account_name character varying(100),
    status public.enum_vendors_status DEFAULT 'pending'::public.enum_vendors_status,
    rejection_reason text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20240101000001-create-admins.js
20240101000002-create-members.js
20240101000003-create-vendors.js
20240101000004-create-products.js
20240101000005-create-master-contracts.js
20240101000006-create-orders.js
20240101000007-create-order-items.js
20240101000008-create-wallet-transactions.js
20240101000009-create-disputes.js
20240101000010-create-survey-entities.js
20240101000011-create-consumption-surveys.js
20240101000012-add-product-extra-fields.js
20240101000013-add-membership-active.js
20240101000014-add-product-category-enums.js
20240101000015-add-wallet-transaction-reason-admin-debit.js
20240101000016-add-member-kyc-fields.js
20240101000010-add-membership-renewal.js
20240101000017-create-survey-agents.js
20240101000018-add-invoice-photo-to-consumption.js
20240101000019-add-payment-fields.js
20240101000020-add-feedback-fields-to-disputes.js
20240101000021-add-feedback-to-disputes.js
20240101000022-add-reviewed-to-disputes-status.js
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, name, email, password, role, is_active, created_at, updated_at) FROM stdin;
6df1d802-8608-4fd8-b3f3-d4ec23999617	SITA Super Admin	jainamps18@gmail.com	$2a$12$SqZFiG7O.5DIAUDsgoc3mec6U.jtXXDmnwJf7.tcNVncqKEmWhM9i	superadmin	t	2026-04-04 15:02:47.307+05:30	2026-04-11 17:22:09.673+05:30
\.


--
-- Data for Name: consumption_surveys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumption_surveys (id, entity_id, product_name, brand, category, monthly_quantity, annual_quantity, unit, price_per_unit, created_at, updated_at, invoice_photo_url) FROM stdin;
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disputes (id, order_id, member_id, vendor_id, reason, description, status, resolution, refund_amount, refund_to_wallet, resolved_at, resolved_by, created_at, updated_at, type, category, rating) FROM stdin;
e22bfc4f-1d8c-497e-88cd-b891f3e8b08c	\N	b3566891-1e03-4c2e-acd4-2ee0cedb6913	\N	\N	sdcvbsewhubvhjubrhurbjhurb jhitrn	resolved	Resolved by admin	\N	f	2026-04-21 16:18:14.772+05:30	6df1d802-8608-4fd8-b3f3-d4ec23999617	2026-04-21 16:16:49.718+05:30	2026-04-21 16:18:14.772+05:30	feedback	Delivery Issue	5
\.


--
-- Data for Name: master_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.master_contracts (id, vendor_id, member_id, product_id, negotiated_price, valid_from, valid_to, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, name, email, phone, hotel_name, hotel_address, city, state, pincode, gstin, status, membership_paid, membership_fee, membership_paid_at, sita_wallet_balance, otp, otp_expires_at, rejection_reason, created_at, updated_at, membership_active, category, gst_number, business_reg_certificate_url, fssai_license_url, establishment_front_photo_url, billing_counter_photo_url, kitchen_photo_url, menu_card_photo_url, latitude, longitude, district, geo_timestamp, membership_start_date, membership_expiry_date, membership_status, utr_number, payment_submitted_at, payment_verified_by, payment_verified_at, payment_status, payment_rejection_reason) FROM stdin;
dc013ffb-aed3-4ba9-a0f1-2e43fd46148a	jainam	jainam@gmail.com	9375894466	sita restaurant	jaianamm	surat	guajrat	395007	123456789999999	active	t	5000.00	2026-04-18 13:47:42.002+05:30	0.00	\N	\N	\N	2026-04-18 13:42:15.294+05:30	2026-04-18 13:48:52.661+05:30	t	bhojan_shala	123456789999999	/uploads/kyc/9c8a7409-bf7a-4717-8d9b-553d6c1ea4f5.jpg	/uploads/kyc/ca1155c9-4d72-4afe-921b-3c2cf1a8883a.jpg	/uploads/kyc/93fd2b9e-c6c1-46c5-9977-83c1dc5e9f6b.jpg	/uploads/kyc/37997954-ed49-462e-8760-b47520166be2.jpg	/uploads/kyc/0a87c549-fa52-46c6-be0f-54ad4dc37fe6.jpg	/uploads/kyc/1a06e117-7849-4bcc-b550-8aca36a9da84.jpg	37.4219983	-122.0840000	surat	2026-04-18 13:42:15.293+05:30	2026-04-18	2027-04-18	active	12345678910	2026-04-18 13:47:11.64+05:30	6df1d802-8608-4fd8-b3f3-d4ec23999617	2026-04-18 13:47:42.002+05:30	verified	\N
53fcbfb8-3536-43fb-a4ea-4e27541b1c4a	piyushkumar shah	jainamps3010@gmail.com	9876543210	nexcred hotel	surat	surat	gujarat	345678	sdvsdvewrvervrr	active	t	5000.00	2026-04-14 12:53:01.208+05:30	0.00	\N	\N	\N	2026-04-14 12:51:42.703+05:30	2026-04-14 12:53:01.208+05:30	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-14	2027-04-14	active	\N	\N	\N	\N	not_paid	\N
b3566891-1e03-4c2e-acd4-2ee0cedb6913	jainam shah	\N	6351328724	sita restaurant	ngnjsfnjbnvjt	ahmedabad	gujarat	395007	857574884858584	active	t	5000.00	2026-04-12 22:47:16.153+05:30	84795.00	\N	\N	\N	2026-04-12 12:04:54.482+05:30	2026-04-24 17:22:17.656+05:30	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-12	2027-04-12	active	\N	\N	\N	\N	not_paid	\N
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price, total_price, product_name, product_unit, created_at, updated_at) FROM stdin;
a9be0aee-a746-4f35-8e91-4201143a2ca3	41db2cce-05fd-46be-93f3-2ed739e44ddd	aa372395-1f8a-4cab-935e-257b429a204c	1	1600.00	1600.00	LPG 19kg	Cylinders	2026-04-20 16:54:48.778+05:30	2026-04-20 16:54:48.778+05:30
b16f8b54-2e5b-4291-9017-85d4700afb3a	6743197f-7e96-4019-a50c-e6009e4fd4d6	aa372395-1f8a-4cab-935e-257b429a204c	1	1600.00	1600.00	LPG 19kg	Cylinders	2026-04-23 14:17:01.36+05:30	2026-04-23 14:17:01.36+05:30
c03462ad-7922-421d-919b-3127f2294db7	6743197f-7e96-4019-a50c-e6009e4fd4d6	1a87c200-e892-436b-aec1-9d0327298e5a	10	96.00	960.00	Hand Wash	Liters	2026-04-23 14:17:01.36+05:30	2026-04-23 14:17:01.36+05:30
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, member_id, vendor_id, status, total_amount, sita_commission, vendor_amount, payment_method, payment_status, delivery_otp, delivery_otp_verified, delivery_address, expected_delivery_date, delivered_at, cancelled_at, cancellation_reason, wallet_amount_used, notes, created_at, updated_at) FROM stdin;
41db2cce-05fd-46be-93f3-2ed739e44ddd	SITA-MO73YAYM-631	b3566891-1e03-4c2e-acd4-2ee0cedb6913	b0329baa-b211-479d-aa97-b67a52a2048f	pending	1600.00	36.00	1564.00	wallet	paid	345027	f	jwjvejvje	\N	\N	\N	\N	1600.00	\N	2026-04-20 16:54:48.767+05:30	2026-04-20 16:54:48.767+05:30
6743197f-7e96-4019-a50c-e6009e4fd4d6	SITA-MOB8MXUW-886	b3566891-1e03-4c2e-acd4-2ee0cedb6913	b0329baa-b211-479d-aa97-b67a52a2048f	pending	2560.00	60.00	2500.00	wallet	paid	447385	f	UHU	\N	\N	\N	\N	2560.00	\N	2026-04-23 14:17:01.352+05:30	2026-04-23 14:17:01.352+05:30
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, vendor_id, name, description, category, unit, price_per_unit, moq, available, approved, image_url, sku, created_at, updated_at, market_price, stock_quantity) FROM stdin;
1ce128eb-7dfc-43a9-895b-3bcf1022e4c4	b0329baa-b211-479d-aa97-b67a52a2048f	Coriander Powder	Ground coriander	spices	Kg	128.00	5	t	t	\N	\N	2026-04-16 16:40:45.941+05:30	2026-04-16 16:41:09.711+05:30	160.00	200
05b4645c-dc93-4903-8590-fb9dd8f338f0	b0329baa-b211-479d-aa97-b67a52a2048f	Cumin Seeds	Whole jeera	spices	Kg	336.00	5	t	t	\N	\N	2026-04-16 16:40:45.939+05:30	2026-04-16 16:41:12.193+05:30	420.00	150
88df2b32-ae32-45c7-8a87-5155e87e8e83	b0329baa-b211-479d-aa97-b67a52a2048f	Turmeric Powder	Pure turmeric	spices	Kg	144.00	5	t	t	\N	\N	2026-04-16 16:40:45.937+05:30	2026-04-16 16:41:18.445+05:30	180.00	200
c26057f9-7bfb-4c02-8efe-f9b3de90d69e	b0329baa-b211-479d-aa97-b67a52a2048f	Red Chilli Powder	Premium red chilli	spices	Kg	224.00	5	t	t	\N	\N	2026-04-16 16:40:45.935+05:30	2026-04-16 16:41:20.044+05:30	280.00	200
864a9ac0-d282-48a2-972d-3d1c207f4d6f	b0329baa-b211-479d-aa97-b67a52a2048f	Moong Dal	Green moong dal	grains	Kg	88.00	25	t	t	\N	\N	2026-04-16 16:40:45.934+05:30	2026-04-16 16:41:21.811+05:30	110.00	500
65691ea8-29b5-4476-8102-ab68b9299a85	b0329baa-b211-479d-aa97-b67a52a2048f	Chana Dal	Split chickpea dal	grains	Kg	76.00	25	t	t	\N	\N	2026-04-16 16:40:45.932+05:30	2026-04-16 16:41:24.127+05:30	95.00	600
031ad3a0-f37a-46aa-a90d-d74c0079ee34	b0329baa-b211-479d-aa97-b67a52a2048f	sunflower oil	\N	oils	Liters	70.00	5	t	t	\N	\N	2026-04-12 12:25:03.214+05:30	2026-04-12 12:30:11.258+05:30	100.00	100
884be9e0-f373-494f-b678-5aa0fc3f448d	b0329baa-b211-479d-aa97-b67a52a2048f	wheat	\N	grains	Kg	150.00	10	t	t	\N	\N	2026-04-12 22:50:44.705+05:30	2026-04-12 22:50:46.378+05:30	200.00	50
aa372395-1f8a-4cab-935e-257b429a204c	b0329baa-b211-479d-aa97-b67a52a2048f	LPG 19kg	19kg commercial	gas	Cylinders	1600.00	1	t	t	\N	\N	2026-04-16 16:40:45.945+05:30	2026-04-23 14:17:01.365+05:30	1800.00	49
b816e8fe-e861-4b96-825b-830b12a1981c	b0329baa-b211-479d-aa97-b67a52a2048f	Toilet Cleaner	Acid toilet cleaner	cleaning_supplies	Liters	60.00	10	t	t	\N	\N	2026-04-16 16:40:45.95+05:30	2026-04-16 16:40:53.327+05:30	75.00	200
adbe5eee-f9cb-41da-a1b2-0d35708b7a0f	b0329baa-b211-479d-aa97-b67a52a2048f	Floor Cleaner	Industrial floor cleaner	cleaning_supplies	Liters	76.00	10	t	t	\N	\N	2026-04-16 16:40:45.948+05:30	2026-04-16 16:40:55.161+05:30	95.00	250
54d7875e-3f32-4889-b890-fae81d0a5e8c	b0329baa-b211-479d-aa97-b67a52a2048f	Dishwash Liquid	Commercial dishwash	cleaning_supplies	Liters	68.00	10	t	t	\N	\N	2026-04-16 16:40:45.947+05:30	2026-04-16 16:40:56.427+05:30	85.00	300
1a87c200-e892-436b-aec1-9d0327298e5a	b0329baa-b211-479d-aa97-b67a52a2048f	Hand Wash	Antibacterial hand wash	cleaning_supplies	Liters	96.00	10	t	t	\N	\N	2026-04-16 16:40:45.951+05:30	2026-04-23 14:17:01.367+05:30	120.00	190
caf07da0-1515-4d7f-aa44-0f903395e00f	b0329baa-b211-479d-aa97-b67a52a2048f	Groundnut Oil	Pure groundnut oil	oils	Liters	120.00	10	t	t	\N	\N	2026-04-16 16:40:45.92+05:30	2026-04-16 16:41:07.311+05:30	150.00	400
e5c895dd-711f-45f3-b4be-7c910743d6bf	b0329baa-b211-479d-aa97-b67a52a2048f	Toor Dal	Yellow toor dal	grains	Kg	96.00	25	t	t	\N	\N	2026-04-16 16:40:45.931+05:30	2026-04-16 16:41:27.626+05:30	120.00	800
82ed6f48-36dc-42c1-a809-e7992f43b03f	b0329baa-b211-479d-aa97-b67a52a2048f	Sugar	Refined white sugar	grains	Kg	34.00	50	t	t	\N	\N	2026-04-16 16:40:45.929+05:30	2026-04-16 16:41:29.411+05:30	42.00	1500
c9f56b33-f97c-4127-90e5-b150c7eac284	b0329baa-b211-479d-aa97-b67a52a2048f	Wheat Flour	Fine wheat flour	grains	Kg	36.00	50	t	t	\N	\N	2026-04-16 16:40:45.925+05:30	2026-04-16 16:41:30.777+05:30	45.00	2000
97736106-77bd-46e4-94a8-edd990d054a5	b0329baa-b211-479d-aa97-b67a52a2048f	Basmati Rice	Long grain basmati rice	grains	Kg	68.00	25	t	t	\N	\N	2026-04-16 16:40:45.923+05:30	2026-04-16 16:41:32.261+05:30	85.00	1000
a8cc0676-038f-47e7-afbe-3205f2460321	b0329baa-b211-479d-aa97-b67a52a2048f	Coconut Oil	Pure coconut oil	oils	Liters	160.00	10	t	t	\N	\N	2026-04-16 16:40:45.921+05:30	2026-04-16 16:41:33.544+05:30	200.00	200
f6471f14-33c3-47a1-af80-e5cfcb5a4adc	b0329baa-b211-479d-aa97-b67a52a2048f	Sunflower Oil	Premium sunflower oil	oils	Liters	95.00	10	t	t	\N	\N	2026-04-16 16:40:45.912+05:30	2026-04-16 16:41:36.209+05:30	120.00	500
8f0ebd55-58cd-466d-bf2a-d0d2587307a3	b0329baa-b211-479d-aa97-b67a52a2048f	Mustard Oil	Pure mustard oil	oils	Liters	88.00	10	t	t	\N	\N	2026-04-16 16:40:45.918+05:30	2026-04-16 16:41:37.46+05:30	110.00	300
dbe34919-c0a6-4a40-becc-0f2ea365b428	b0329baa-b211-479d-aa97-b67a52a2048f	Phenyl	Black phenyl	cleaning_supplies	Liters	52.00	10	f	t	\N	\N	2026-04-16 16:40:45.953+05:30	2026-04-16 17:09:33.225+05:30	65.00	300
54d192bb-a5ea-431b-a9a0-3b968eb1d5f1	b0329baa-b211-479d-aa97-b67a52a2048f	LPG 14kg	14kg LPG cylinder	gas	Cylinders	850.00	1	f	t	\N	\N	2026-04-16 16:40:45.943+05:30	2026-04-16 17:09:41.571+05:30	950.00	100
ec10e412-2b9a-4c60-8d4c-efa660462bde	b0329baa-b211-479d-aa97-b67a52a2048f	Garam Masala	Mixed spices	spices	Kg	280.00	5	f	t	\N	\N	2026-04-16 16:40:45.942+05:30	2026-04-16 17:09:42.704+05:30	350.00	100
c0761eee-1381-4aea-a374-8cd9b876a2cb	b0329baa-b211-479d-aa97-b67a52a2048f	Sunflower Oil	Premium sunflower oil	oils	Liters	95.00	10	t	f	\N	\N	2026-04-17 22:10:23.231+05:30	2026-04-17 22:10:23.231+05:30	120.00	500
9b1eca2c-721a-4e70-9c19-7a2f2c96ed17	b0329baa-b211-479d-aa97-b67a52a2048f	Mustard Oil	Pure mustard oil	oils	Liters	88.00	10	t	f	\N	\N	2026-04-17 22:10:23.235+05:30	2026-04-17 22:10:23.235+05:30	110.00	300
c9ccc2ff-195e-4f92-95f2-75e7c6ad1417	b0329baa-b211-479d-aa97-b67a52a2048f	Groundnut Oil	Pure groundnut oil	oils	Liters	120.00	10	t	f	\N	\N	2026-04-17 22:10:23.237+05:30	2026-04-17 22:10:23.237+05:30	150.00	400
aa810e2d-5e0f-462e-8708-b13420ed96fa	b0329baa-b211-479d-aa97-b67a52a2048f	Coconut Oil	Pure coconut oil	oils	Liters	160.00	10	t	f	\N	\N	2026-04-17 22:10:23.239+05:30	2026-04-17 22:10:23.239+05:30	200.00	200
f0cb1d09-c753-46aa-93e3-62715443dc1c	b0329baa-b211-479d-aa97-b67a52a2048f	Basmati Rice	Long grain basmati rice	grains	Kg	68.00	25	t	f	\N	\N	2026-04-17 22:10:23.24+05:30	2026-04-17 22:10:23.24+05:30	85.00	1000
7c9e8b40-363a-4865-bfaf-db898cd65690	b0329baa-b211-479d-aa97-b67a52a2048f	Wheat Flour	Fine wheat flour	grains	Kg	36.00	50	t	f	\N	\N	2026-04-17 22:10:23.242+05:30	2026-04-17 22:10:23.242+05:30	45.00	2000
05b4b0e5-bc83-4693-963c-74b59e3fdb34	b0329baa-b211-479d-aa97-b67a52a2048f	Sugar	Refined white sugar	grains	Kg	34.00	50	t	f	\N	\N	2026-04-17 22:10:23.243+05:30	2026-04-17 22:10:23.243+05:30	42.00	1500
0e7fb32c-d560-4e58-a893-16b031e737a8	b0329baa-b211-479d-aa97-b67a52a2048f	Toor Dal	Yellow toor dal	grains	Kg	96.00	25	t	f	\N	\N	2026-04-17 22:10:23.244+05:30	2026-04-17 22:10:23.244+05:30	120.00	800
6bfe5aec-2a5f-45da-a982-44d9489d38a3	b0329baa-b211-479d-aa97-b67a52a2048f	Chana Dal	Split chickpea dal	grains	Kg	76.00	25	t	f	\N	\N	2026-04-17 22:10:23.245+05:30	2026-04-17 22:10:23.245+05:30	95.00	600
4d1142bc-d50f-4769-ae81-500886f2eb2d	b0329baa-b211-479d-aa97-b67a52a2048f	Moong Dal	Green moong dal	grains	Kg	88.00	25	t	f	\N	\N	2026-04-17 22:10:23.246+05:30	2026-04-17 22:10:23.246+05:30	110.00	500
79666233-5b06-48b9-a269-0b330e731e58	b0329baa-b211-479d-aa97-b67a52a2048f	Red Chilli Powder	Premium red chilli	spices	Kg	224.00	5	t	f	\N	\N	2026-04-17 22:10:23.249+05:30	2026-04-17 22:10:23.249+05:30	280.00	200
a5467ed0-606f-4daf-b4b5-ac7de8dabc5d	b0329baa-b211-479d-aa97-b67a52a2048f	Turmeric Powder	Pure turmeric	spices	Kg	144.00	5	t	f	\N	\N	2026-04-17 22:10:23.25+05:30	2026-04-17 22:10:23.25+05:30	180.00	200
1e0d927b-b59f-4ace-b715-57d18a4ec7f7	b0329baa-b211-479d-aa97-b67a52a2048f	Cumin Seeds	Whole jeera	spices	Kg	336.00	5	t	f	\N	\N	2026-04-17 22:10:23.251+05:30	2026-04-17 22:10:23.251+05:30	420.00	150
085b603f-0687-4bb7-9c1d-a5ae9b449fec	b0329baa-b211-479d-aa97-b67a52a2048f	Coriander Powder	Ground coriander	spices	Kg	128.00	5	t	f	\N	\N	2026-04-17 22:10:23.252+05:30	2026-04-17 22:10:23.252+05:30	160.00	200
ee2c199a-ddfb-49a5-9914-eee642a4c765	b0329baa-b211-479d-aa97-b67a52a2048f	Garam Masala	Mixed spices	spices	Kg	280.00	5	t	f	\N	\N	2026-04-17 22:10:23.252+05:30	2026-04-17 22:10:23.252+05:30	350.00	100
15e4c3dc-82c3-4600-af27-f894bf1e5388	b0329baa-b211-479d-aa97-b67a52a2048f	LPG 14kg	14kg LPG cylinder	gas	Cylinders	850.00	1	t	f	\N	\N	2026-04-17 22:10:23.253+05:30	2026-04-17 22:10:23.253+05:30	950.00	100
e94b1996-a911-4cea-a4ed-10c574974960	b0329baa-b211-479d-aa97-b67a52a2048f	LPG 19kg	19kg commercial	gas	Cylinders	1600.00	1	t	f	\N	\N	2026-04-17 22:10:23.254+05:30	2026-04-17 22:10:23.254+05:30	1800.00	50
e1e8be06-2881-4e90-89a9-447b7969d0d4	b0329baa-b211-479d-aa97-b67a52a2048f	Dishwash Liquid	Commercial dishwash	cleaning_supplies	Liters	68.00	10	t	f	\N	\N	2026-04-17 22:10:23.255+05:30	2026-04-17 22:10:23.255+05:30	85.00	300
077f7db2-b045-400b-9d3c-918f540e4d2c	b0329baa-b211-479d-aa97-b67a52a2048f	Floor Cleaner	Industrial floor cleaner	cleaning_supplies	Liters	76.00	10	t	f	\N	\N	2026-04-17 22:10:23.257+05:30	2026-04-17 22:10:23.257+05:30	95.00	250
b35ca08d-5d4b-41cd-b717-612c0769bdbf	b0329baa-b211-479d-aa97-b67a52a2048f	Toilet Cleaner	Acid toilet cleaner	cleaning_supplies	Liters	60.00	10	t	f	\N	\N	2026-04-17 22:10:23.258+05:30	2026-04-17 22:10:23.258+05:30	75.00	200
945b4c53-b87f-40a4-8e2a-e5db9270bc72	b0329baa-b211-479d-aa97-b67a52a2048f	Hand Wash	Antibacterial hand wash	cleaning_supplies	Liters	96.00	10	t	f	\N	\N	2026-04-17 22:10:23.258+05:30	2026-04-17 22:10:23.258+05:30	120.00	200
\.


--
-- Data for Name: sita_wallet_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sita_wallet_transactions (id, member_id, type, amount, balance_after, reason, description, order_id, reference_id, created_at, updated_at) FROM stdin;
b037124c-be7f-407d-81c7-335e0c0054ee	b3566891-1e03-4c2e-acd4-2ee0cedb6913	credit	1000.00	1000.00	admin_credit	gift	\N	\N	2026-04-12 12:13:17.119+05:30	2026-04-12 12:13:17.119+05:30
6b9dcef0-dd16-4783-9fa2-6292ee773bf7	b3566891-1e03-4c2e-acd4-2ee0cedb6913	credit	1000.00	2000.00	admin_credit	gj	\N	\N	2026-04-12 12:32:48.054+05:30	2026-04-12 12:32:48.054+05:30
bc636a57-ee17-4de2-9b68-9436fe771ffe	b3566891-1e03-4c2e-acd4-2ee0cedb6913	credit	100000.00	102000.00	admin_credit	gift	\N	\N	2026-04-12 22:54:27.564+05:30	2026-04-12 22:54:27.564+05:30
4c1daa2d-9fd7-4da2-bbab-7774e40809fc	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	2660.00	90000.00	admin_debit	FINE	\N	\N	2026-04-16 16:56:57.52+05:30	2026-04-16 16:56:57.52+05:30
d3e9d936-65ff-4f93-bdb8-3da8f997c374	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	1425.00	88955.00	order_payment	Payment for order SITA-MO35KH0Q-634	\N	\N	2026-04-17 22:28:57.968+05:30	2026-04-17 22:28:57.968+05:30
4cd11335-aa18-42f1-b61d-ea914ac9c776	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	16000.00	76380.00	order_payment	Payment for order SITA-MO34OM62-683	\N	\N	2026-04-17 22:04:11.659+05:30	2026-04-17 22:04:11.659+05:30
2c992d08-b700-4cdb-a5b6-45a631e41df1	b3566891-1e03-4c2e-acd4-2ee0cedb6913	credit	14000.00	90380.00	order_refund	Refund with ₹2000 penalty for cancelled order SITA-MO34OM62-683	\N	\N	2026-04-17 22:04:46.644+05:30	2026-04-17 22:04:46.644+05:30
6238f80b-0b4c-4f7b-bc17-a005b5391f8e	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	1840.00	92660.00	order_payment	Payment for order SITA-MO1DXU65-362	\N	\N	2026-04-16 16:47:46.122+05:30	2026-04-16 16:47:46.122+05:30
b791fd5d-c787-4142-b43b-99251a468859	b3566891-1e03-4c2e-acd4-2ee0cedb6913	credit	1380.00	92380.00	order_refund	Refund with ₹460 penalty for cancelled order SITA-MO1DXU65-362	\N	\N	2026-04-16 22:11:05.562+05:30	2026-04-16 22:11:05.562+05:30
6d934426-6c7f-420c-adf3-8c1fbb6daf18	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	1500.00	94500.00	order_payment	Payment for order SITA-MNXGMFWG-313	\N	\N	2026-04-13 22:51:48.559+05:30	2026-04-13 22:51:48.559+05:30
03909fc8-4ff0-4f8f-ab8b-1a5a0fbf0d92	b3566891-1e03-4c2e-acd4-2ee0cedb6913	credit	1000.00	91000.00	order_refund	Refund with ₹500 penalty for cancelled order SITA-MNXGMFWG-313	\N	\N	2026-04-16 22:09:57.453+05:30	2026-04-16 22:09:57.453+05:30
5a87bf00-42a2-485d-9947-1a5a82234126	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	2250.00	96000.00	order_payment	Payment for order SITA-MNX71G2P-090	\N	\N	2026-04-13 18:23:32.458+05:30	2026-04-13 18:23:32.458+05:30
9d1f1e16-aad8-4c7f-a737-e849d1b88540	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	3750.00	98250.00	order_payment	Payment for order SITA-MNW1A376-907	\N	\N	2026-04-12 22:54:31.805+05:30	2026-04-12 22:54:31.805+05:30
b3c448f4-a2b0-43ac-b033-88bf4a7e9b8b	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	1600.00	87355.00	order_payment	Payment for order SITA-MO73YAYM-631	41db2cce-05fd-46be-93f3-2ed739e44ddd	\N	2026-04-20 16:54:48.786+05:30	2026-04-20 16:54:48.786+05:30
db1ee73d-d16d-4823-85a6-471ad0186370	b3566891-1e03-4c2e-acd4-2ee0cedb6913	debit	2560.00	84795.00	order_payment	Payment for order SITA-MOB8MXUW-886	6743197f-7e96-4019-a50c-e6009e4fd4d6	\N	2026-04-23 14:17:01.369+05:30	2026-04-23 14:17:01.369+05:30
\.


--
-- Data for Name: survey_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_agents (id, name, mobile, district, taluka, status, total_surveys, last_survey_at, added_by, created_at, updated_at) FROM stdin;
d00d6647-73e4-4678-8915-524247e89d89	jainam shah	6351328724	surat	surat	approved	2	2026-04-17 14:31:50.771+05:30	6df1d802-8608-4fd8-b3f3-d4ec23999617	2026-04-17 14:03:48.298+05:30	2026-04-17 14:31:50.772+05:30
\.


--
-- Data for Name: survey_entities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_entities (id, agent_id, entity_name, owner_name, mobile, entity_type, address, district, taluka, created_at, updated_at) FROM stdin;
8dc435d8-27b1-4f14-a968-1bde02b6f158	6351328724	sita	jainam shah	6351328724	Restaurant	surat	surat	surat	2026-04-17 13:28:07.265+05:30	2026-04-17 13:28:07.265+05:30
91306ca3-dd17-415a-9ae7-5547e4e8de3c	6351328724	sita	jainam	6351328724	Restaurant	fnnrf we we	surat	surat	2026-04-17 13:41:47.843+05:30	2026-04-17 13:41:47.843+05:30
e469ce0d-9282-44dd-b539-e77eabf00674	6351328724	hotel	jainam	9714949495	Hotel	jshshs	surat	surat	2026-04-17 22:17:57.596+05:30	2026-04-17 22:17:57.596+05:30
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, name, email, phone, company_name, gstin, category, description, address, city, state, bank_account_number, bank_ifsc, bank_account_name, status, rejection_reason, created_at, updated_at) FROM stdin;
b0329baa-b211-479d-aa97-b67a52a2048f	suresh	itc@gmail.com	5646736878	itc	7f57bg75hg757g7	food_beverages	\N	\N	surat	Gujarat	\N	\N	\N	active	\N	2026-04-12 12:08:07.104+05:30	2026-04-12 12:08:09.232+05:30
\.


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: consumption_surveys consumption_surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumption_surveys
    ADD CONSTRAINT consumption_surveys_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: master_contracts master_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_contracts
    ADD CONSTRAINT master_contracts_pkey PRIMARY KEY (id);


--
-- Name: members members_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key UNIQUE (phone);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sita_wallet_transactions sita_wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sita_wallet_transactions
    ADD CONSTRAINT sita_wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: survey_agents survey_agents_mobile_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_agents
    ADD CONSTRAINT survey_agents_mobile_key UNIQUE (mobile);


--
-- Name: survey_agents survey_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_agents
    ADD CONSTRAINT survey_agents_pkey PRIMARY KEY (id);


--
-- Name: survey_entities survey_entities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_entities
    ADD CONSTRAINT survey_entities_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_email_key UNIQUE (email);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: consumption_surveys_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consumption_surveys_category ON public.consumption_surveys USING btree (category);


--
-- Name: consumption_surveys_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consumption_surveys_entity_id ON public.consumption_surveys USING btree (entity_id);


--
-- Name: disputes_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX disputes_member_id ON public.disputes USING btree (member_id);


--
-- Name: disputes_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX disputes_order_id ON public.disputes USING btree (order_id);


--
-- Name: disputes_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX disputes_status ON public.disputes USING btree (status);


--
-- Name: order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: orders_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_member_id ON public.orders USING btree (member_id);


--
-- Name: orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status ON public.orders USING btree (status);


--
-- Name: orders_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_vendor_id ON public.orders USING btree (vendor_id);


--
-- Name: products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category ON public.products USING btree (category);


--
-- Name: products_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_vendor_id ON public.products USING btree (vendor_id);


--
-- Name: sita_wallet_transactions_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sita_wallet_transactions_member_id ON public.sita_wallet_transactions USING btree (member_id);


--
-- Name: survey_entities_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_entities_agent_id ON public.survey_entities USING btree (agent_id);


--
-- Name: survey_entities_district; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_entities_district ON public.survey_entities USING btree (district);


--
-- Name: survey_entities_entity_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_entities_entity_type ON public.survey_entities USING btree (entity_type);


--
-- Name: consumption_surveys consumption_surveys_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumption_surveys
    ADD CONSTRAINT consumption_surveys_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.survey_entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: disputes disputes_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: disputes disputes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: disputes disputes_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: master_contracts master_contracts_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_contracts
    ADD CONSTRAINT master_contracts_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: master_contracts master_contracts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_contracts
    ADD CONSTRAINT master_contracts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: master_contracts master_contracts_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_contracts
    ADD CONSTRAINT master_contracts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: orders orders_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE RESTRICT;


--
-- Name: orders orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE RESTRICT;


--
-- Name: products products_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: sita_wallet_transactions sita_wallet_transactions_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sita_wallet_transactions
    ADD CONSTRAINT sita_wallet_transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: sita_wallet_transactions sita_wallet_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sita_wallet_transactions
    ADD CONSTRAINT sita_wallet_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict XzrdOgjZFeFWthEqN7qt1Q62kALRpDldJwMHymRY3Yq9hz5012vTlTRVfIdhaOy

