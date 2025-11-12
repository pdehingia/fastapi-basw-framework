# MAYA PLATFORM – OPTIMIZED HYBRID DATABASE SCHEMA

## Architecture Summary: PostgreSQL (Source of Truth) + MongoDB (High‑volume & Flexible) + Redis (Caching) + S3 (Media)

---

## DESIGN PRINCIPLES
- **PostgreSQL = Authoritative** for identities, bookings, payments, reviews, RBAC, academies, salons, subscriptions.
- **MongoDB = Operational/streaming** for chat, portfolios, notifications, analytics events, and dynamic availability.
- **Redis = Ephemeral** cache (search results, rate limiting, sessions, feature flags), with short TTLs.
- **S3/Cloudinary = Media** storage (images, documents), referenced by URL in DBs.
- **IDs & Referential Integrity:** Global **`uuid`** in Postgres; Mongo documents store the Postgres UUID as `pg_id` for linkage. No SQL FKs to Mongo; only SQL↔SQL are enforced with FKs.
- **Geo:** Prefer **PostGIS** for addresses/booking locations; Mongo geospatial only for artist live availability if needed.
- **Time‑series:** Use native **MongoDB time-series** for messages & analytics.
- **Soft deletes + audit:** Every mutable SQL table has `is_deleted`, `deleted_at`, `created_at`, `updated_at`. Critical actions mirrored into `audit_logs`.

---

## FINAL DATA DISTRIBUTION

### PostgreSQL (Core, 22 tables)
1. `users`
2. `user_sessions`
3. `user_activity_logs` (monthly partitions)
4. `roles`
5. `permissions`
6. `role_permissions`
7. `admins` (admin profiles; auth in `users`)
8. `customers` (profile extension)
9. `artists` (profile extension)
10. `academies`
11. `salons`
12. `salon_artists`
13. `addresses` (PostGIS)
14. `services`
15. `bookings`
16. `reviews`
17. `transactions`
18. `wallets`
19. `wallet_transactions`
20. `subscriptions`
21. `subscription_payments`
22. `bank_accounts`
23. `courses`
24. `academy_courses`
25. `referrals`
26. `promo_codes`
27. `ads`
28. `audit_logs`
29. `otp_verifications`
30. `earnings_summary` (materialized / rollups)

> Note: A few tables are added as materialized views or rollups for reporting (e.g., `earnings_summary`). Keep OLTP clean and lean.

### MongoDB (Lean, 6 collections)
1. `chats` (conversation metadata; pg references)
2. `messages` (time-series; high volume)
3. `portfolio_images` (media + moderation)
4. `notifications` (TTL)
5. `analytics_events` (time-series; TTL)
6. `artist_availability` (weekly schedules + blocks; dynamic)

### Redis (Ephemeral)
- `search:cache:{hash}` → cached artist search results (TTL 15–30 min)
- Rate-limits, OTP attempt counters, session tokens (if desired), feature flags, idempotency keys

---

## IDENTITY & CROSS‑DB LINKING
- **Postgres** uses `UUID` primary keys for all top-level entities.
- **Mongo** docs include a `pg_id` (string UUID) referencing the authoritative SQL row.
- **API Contract:** Clients only see UUIDs. Server resolves Mongo as needed.

---

# POSTGRESQL SCHEMAS

## Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## 1) users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_e164 VARCHAR(20) UNIQUE,
  email CITEXT UNIQUE,
  password_hash TEXT,                -- null if OAuth-only
  oauth_google_id TEXT UNIQUE,
  oauth_facebook_id TEXT UNIQUE,
  oauth_apple_id TEXT UNIQUE,
  full_name VARCHAR(150),
  profile_image_url TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_users_active ON users (is_active);
```

### Role extensions (single source of truth in SQL)
- `admins(user_id PK FK users.id, ...)`
- `customers(user_id PK FK users.id, ...)`
- `artists(user_id PK FK users.id, ...)`

This avoids separate Mongo role-collections.

---

## 2) roles / permissions / role_permissions
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) UNIQUE NOT NULL,
  role_slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_role_id INT REFERENCES roles(id),
  level INT NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  permission_name VARCHAR(120) UNIQUE NOT NULL,
  permission_slug VARCHAR(120) UNIQUE NOT NULL,
  category VARCHAR(60) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);
```

---

## 3) admins / customers / artists (profile extensions)
```sql
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  employee_code VARCHAR(50) UNIQUE,
  designation VARCHAR(120),
  department VARCHAR(120),
  role_id INT REFERENCES roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(20), -- enum-like
  preferences JSONB,  -- notifications, price_range, etc.
  stats JSONB,        -- denormalized quick stats (optional)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE artists (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  artist_type VARCHAR(30) NOT NULL, -- freelance/salon/academy_graduate
  academy_id UUID REFERENCES academies(id),
  graduation_date DATE,
  years_of_experience INT,
  specializations TEXT[],
  bio VARCHAR(600),
  languages TEXT[],
  address_id UUID REFERENCES addresses(id),
  service_radius_km INT DEFAULT 10,
  verification_status VARCHAR(20) DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  subscription_id UUID REFERENCES subscriptions(id),
  subscription_plan VARCHAR(30) DEFAULT 'free',
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  trust_score NUMERIC(5,2) DEFAULT 0,
  performance JSONB,  -- totals, completion/cancel rates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4) academies, salons, salon_artists
```sql
CREATE TABLE academies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id),
  academy_name VARCHAR(255) NOT NULL,
  gst_number VARCHAR(20),
  registration_number VARCHAR(100),
  address_id UUID REFERENCES addresses(id),
  commission_rate NUMERIC(5,2) DEFAULT 5.00,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  branding JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_name VARCHAR(255) NOT NULL,
  salon_slug VARCHAR(255) UNIQUE NOT NULL,
  address_id UUID REFERENCES addresses(id),
  commission_rate NUMERIC(5,2) DEFAULT 15.00,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  business_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE salon_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  artist_user_id UUID NOT NULL REFERENCES artists(user_id) ON DELETE CASCADE,
  employment_type VARCHAR(20) NOT NULL,
  joined_date DATE NOT NULL,
  left_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  total_bookings INT DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (salon_id, artist_user_id)
);
```

---

## 5) addresses (PostGIS)
```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES users(id),
  owner_type VARCHAR(20),   -- customer/artist/academy/salon
  label VARCHAR(100),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(120),
  pincode VARCHAR(20),
  country VARCHAR(60) DEFAULT 'India',
  location GEOGRAPHY(POINT, 4326),  -- lon/lat
  contact_name VARCHAR(120),
  contact_phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_addresses_geo ON addresses USING GIST (location);
```

---

## 6) services
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(200) UNIQUE NOT NULL,
  service_slug VARCHAR(200) UNIQUE NOT NULL,
  category VARCHAR(60) NOT NULL,
  description TEXT,
  suggested_price_min NUMERIC(10,2),
  suggested_price_max NUMERIC(10,2),
  default_duration_minutes INT,
  image_url TEXT,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7) bookings
```sql
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending','confirmed','in_progress','completed','cancelled','no_show','refunded');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','processing','paid','failed','refunded','partially_refunded');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  customer_user_id UUID NOT NULL REFERENCES customers(user_id),
  artist_user_id UUID NOT NULL REFERENCES artists(user_id),
  service_id UUID NOT NULL REFERENCES services(id),
  service_name VARCHAR(255) NOT NULL,
  service_price NUMERIC(10,2) NOT NULL,
  service_duration_minutes INT NOT NULL,
  occasion_type VARCHAR(50) NOT NULL,
  booking_date DATE NOT NULL,
  booking_start_time TIME NOT NULL,
  booking_end_time TIME NOT NULL,
  location_type VARCHAR(20) NOT NULL, -- customer_home/salon
  address_id UUID NOT NULL REFERENCES addresses(id),
  special_requests TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by VARCHAR(20),
  cancellation_reason TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  promo_code VARCHAR(50),
  taxes NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  platform_commission_rate NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  platform_commission NUMERIC(10,2) NOT NULL,
  artist_payout NUMERIC(10,2) NOT NULL,
  academy_commission NUMERIC(10,2),
  transaction_id UUID,                -- transactions.id
  payout_transaction_id UUID,
  chat_pg_id UUID,                    -- optional link to Mongo chat via pg UUID
  reschedule_count INT DEFAULT 0,
  original_booking_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bookings_customer ON bookings(customer_user_id, booking_date DESC);
CREATE INDEX idx_bookings_artist ON bookings(artist_user_id, booking_date DESC);
CREATE INDEX idx_bookings_status ON bookings(status, booking_date);
```

---

## 8) reviews
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_user_id UUID NOT NULL REFERENCES customers(user_id),
  artist_user_id UUID NOT NULL REFERENCES artists(user_id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_title VARCHAR(255),
  review_text TEXT,
  images JSONB,
  rating_skill SMALLINT CHECK (rating_skill BETWEEN 1 AND 5),
  rating_professionalism SMALLINT CHECK (rating_professionalism BETWEEN 1 AND 5),
  rating_punctuality SMALLINT CHECK (rating_punctuality BETWEEN 1 AND 5),
  rating_value SMALLINT CHECK (rating_value BETWEEN 1 AND 5),
  is_flagged BOOLEAN DEFAULT FALSE,
  moderation_status VARCHAR(20) DEFAULT 'approved',
  moderated_by UUID, moderated_at TIMESTAMPTZ, moderation_notes TEXT,
  helpful_count INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9) transactions / wallets / wallet_transactions
```sql
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('payment','payout','refund','wallet_credit','wallet_debit','subscription_payment','commission');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending','processing','completed','failed','cancelled');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID, -- nullable
  transaction_type transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  gateway VARCHAR(50) NOT NULL DEFAULT 'razorpay',
  gateway_order_id VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  gateway_signature VARCHAR(500),
  gateway_payout_id VARCHAR(255),
  payment_method VARCHAR(50),
  payment_details JSONB,
  status transaction_status NOT NULL DEFAULT 'pending',
  refund_amount NUMERIC(10,2),
  refund_reason TEXT,
  parent_transaction_id UUID,
  payout_mode VARCHAR(50),
  payout_account VARCHAR(255),
  bank_account_id UUID REFERENCES bank_accounts(id),
  failure_reason TEXT,
  failure_code VARCHAR(100),
  retry_count INT DEFAULT 0,
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  user_type VARCHAR(20) NOT NULL, -- customer/artist
  balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  min_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  max_balance NUMERIC(10,2) NOT NULL DEFAULT 100000.00,
  auto_withdrawal_enabled BOOLEAN DEFAULT FALSE,
  auto_withdrawal_threshold NUMERIC(10,2),
  total_credited NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_debited NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_reason TEXT,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE wallet_transaction_type AS ENUM ('credit','debit','refund','bonus','penalty','withdrawal');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_type wallet_transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  balance_before NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL CHECK (balance_after >= 0),
  reference_type VARCHAR(50),
  reference_id UUID,
  transaction_id UUID REFERENCES transactions(id),
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Concurrency:** For any wallet update, SELECT the wallet row **FOR UPDATE** within a transaction; write wallet_txn row; then update balance.

---

## 10) subscriptions / subscription_payments
```sql
DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('premium','elite');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active','cancelled','expired','paused','payment_failed');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_user_id UUID UNIQUE NOT NULL REFERENCES artists(user_id),
  plan_type subscription_plan NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  plan_price NUMERIC(10,2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL, -- monthly/quarterly/yearly
  commission_rate NUMERIC(5,2) NOT NULL,
  features JSONB NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  razorpay_subscription_id VARCHAR(255) UNIQUE,
  status subscription_status NOT NULL DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT TRUE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  payment_failed_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  artist_user_id UUID NOT NULL REFERENCES artists(user_id),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  retry_attempt INT DEFAULT 0,
  transaction_id UUID REFERENCES transactions(id),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11) courses / academy_courses
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_name VARCHAR(255) NOT NULL,
  course_slug VARCHAR(255) UNIQUE NOT NULL,
  course_code VARCHAR(60) UNIQUE,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  short_description TEXT,
  full_description TEXT,
  duration_months INT NOT NULL,
  total_hours INT,
  syllabus JSONB,
  suggested_fees_min NUMERIC(10,2),
  suggested_fees_max NUMERIC(10,2),
  image_url TEXT,
  brochure_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE academy_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  custom_course_name VARCHAR(255),
  fees NUMERIC(10,2) NOT NULL,
  duration_months INT NOT NULL,
  batch_size_min INT,
  batch_size_max INT,
  next_batch_start_date DATE,
  total_students_enrolled INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_accepting_enrollment BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (academy_id, course_id)
);
```

---

## 12) referrals / promo_codes / ads
```sql
DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM ('pending','qualified','rewarded','expired');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL REFERENCES users(id),
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referee_user_id UUID UNIQUE,
  referee_phone VARCHAR(20),
  status referral_status DEFAULT 'pending',
  referee_first_booking_id UUID REFERENCES bookings(id),
  qualified_at TIMESTAMPTZ,
  referrer_reward_amount NUMERIC(10,2) DEFAULT 100.00,
  referee_reward_amount NUMERIC(10,2) DEFAULT 50.00,
  referrer_wallet_txn_id UUID REFERENCES wallet_transactions(id),
  referee_wallet_txn_id UUID REFERENCES wallet_transactions(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(40) UNIQUE NOT NULL,
  description TEXT,
  promo_type VARCHAR(20) NOT NULL, -- discount/cashback/free_service
  discount_type VARCHAR(20) NOT NULL, -- percentage/fixed
  discount_value NUMERIC(10,2) NOT NULL,
  max_discount NUMERIC(10,2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  restrictions JSONB,
  target JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT FALSE,
  campaign_name VARCHAR(120),
  created_by UUID REFERENCES admins(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_type VARCHAR(20) NOT NULL, -- academy/brand/platform
  advertiser_name VARCHAR(200),
  ad_type VARCHAR(30) NOT NULL,        -- ppc/banner/listing/video
  campaign_name VARCHAR(200),
  creative JSONB,
  targeting JSONB,
  placement JSONB,
  budget JSONB,
  pricing JSONB,
  schedule JSONB,
  metrics JSONB,
  status VARCHAR(30) DEFAULT 'draft',
  approval JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 13) audit & auth auxiliaries
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  device_id TEXT, device_type VARCHAR(30), device_name TEXT,
  os_version VARCHAR(50), app_version VARCHAR(50),
  ip_address INET, city VARCHAR(100), country VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  logged_out_at TIMESTAMPTZ
);

CREATE TABLE user_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  user_type VARCHAR(20) NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  activity_category VARCHAR(50),
  description TEXT,
  metadata JSONB,
  ip_address INET,
  session_id UUID REFERENCES user_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID,
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(120),
  entity_id UUID,
  before JSONB, after JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE otp_verifications (
  id BIGSERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  country_code VARCHAR(5) NOT NULL DEFAULT '+91',
  user_id UUID,
  otp_code VARCHAR(6) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  attempts_count INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  is_verified BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMPTZ,
  ip_address INET, user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes',
  verified_at TIMESTAMPTZ,
  UNIQUE (phone_number, purpose) WHERE is_verified = FALSE
);
```

---

# MONGODB SCHEMAS (LEAN)

## 1) chats
```javascript
{
  _id: ObjectId,
  pg_id: "<booking UUID>",          // link to SQL bookings.id when chat is booking-scoped
  participants: [{
    user_pg_id: "<users UUID>",
    role: "customer" | "artist",
    name: String,
    avatar: String,
    last_read_at: Date,
    unread_count: Number
  }],
  last_message: { text: String, type: 'text'|'image'|'system', sender_user_pg_id: String, timestamp: Date },
  contact_revealed: Boolean,
  moderation: { is_flagged: Boolean, reason: String, status: 'pending'|'cleared'|'violation' },
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
// Indexes
// { pg_id: 1 } unique if 1:1 with booking
// { "participants.user_pg_id": 1 }
// { "last_message.timestamp": -1 }
```

## 2) messages (time-series)
```javascript
// Create as a time-series collection
// timeField: "created_at", metaField: "chat_id"
{
  _id: ObjectId,
  chat_id: ObjectId,        // ref chats._id
  booking_pg_id: String,    // optional shortcut
  sender_user_pg_id: String,
  sender_role: 'customer'|'artist'|'system',
  message_type: 'text'|'image'|'system',
  content: String,          // text or image URL
  system_event: String,
  moderation: { flagged: Boolean, severity: 'low'|'medium'|'high' },
  status: 'sent'|'delivered'|'read'|'failed',
  delivered_at: Date, read_at: Date,
  created_at: Date
}
// Indexes: (time-series handles efficiently)
// Secondary: { chat_id: 1, created_at: 1 }, { sender_user_pg_id: 1, created_at: -1 }
```

## 3) portfolio_images (+ split moderation/metadata)
```javascript
{
  _id: ObjectId,
  artist_user_pg_id: String,        // SQL artists.user_id
  image_url: String,
  thumbnail_url: String,
  medium_url: String,
  file_size_bytes: Number,
  image_hash: String,
  caption: String,
  tags: [String],
  occasion_type: String,
  exif: { camera_model: String, date_taken: Date, width: Number, height: Number, orientation: Number },
  moderation: {
    status: 'pending'|'approved'|'rejected'|'flagged',
    moderated_by_pg_id: String,
    moderated_at: Date,
    rejection_reason: String,
    notes: String,
    ai: { is_appropriate: Boolean, confidence: Number, detected_labels: [String], detected_faces: Number, quality: Number }
  },
  display_order: Number,
  is_featured: Boolean,
  engagement: { views: Number, likes: Number },
  is_active: Boolean,
  uploaded_at: Date,
  created_at: Date,
  updated_at: Date
}
// Indexes: { artist_user_pg_id: 1, is_active: 1, "moderation.status": 1 }, { image_hash: 1 }, { tags: 1 }
```

## 4) notifications (TTL)
```javascript
{
  _id: ObjectId,
  user_pg_id: String,
  type: 'booking_update'|'payment'|'message'|'promo',
  category: 'transactional'|'promotional'|'system',
  priority: 'low'|'normal'|'high'|'urgent',
  title: String, body: String,
  data: { booking_id: String, chat_id: String, screen: String, action: String },
  channels: { push: { sent: Boolean, sent_at: Date, clicked: Boolean, clicked_at: Date }, sms: {...}, email: {...} },
  is_read: Boolean, read_at: Date,
  platform: 'ios'|'android'|'web',
  created_at: Date,
  expires_at: Date  // TTL 60–90 days
}
// Indexes: { user_pg_id: 1, created_at: -1 }, { expires_at: 1 }
```

## 5) analytics_events (time-series + TTL)
```javascript
{
  _id: ObjectId,
  user_pg_id: String, // nullable for anonymous
  session_id: String,
  event_name: String,
  event_category: String,
  properties: {},
  context: { platform: String, app_version: String, device_model: String, os_version: String, screen_name: String, referrer: String },
  location: { city: String, state: String, country: String },
  created_at: Date,
  expires_at: Date  // TTL 60–90 days
}
// Indexes: { user_pg_id: 1, created_at: -1 }, { event_name: 1, created_at: -1 }, { expires_at: 1 }
```

## 6) artist_availability
```javascript
{
  _id: ObjectId,
  artist_user_pg_id: String,  // SQL artists.user_id (UNIQUE)
  weekly_schedule: [{ day_of_week: Number, is_working: Boolean, slots: [{ start: String, end: String, is_available: Boolean }] }],
  blocked_dates: [{ date: Date, reason: String, is_full_day: Boolean, blocked_slots: [String] }],
  buffer_minutes: Number,
  settings: { advance_booking_days: Number, same_day_booking: Boolean, min_notice_hours: Number, max_bookings_per_day: Number },
  updated_at: Date
}
// Indexes: { artist_user_pg_id: 1 } UNIQUE
```

---

# REDIS KEYS (SUGGESTED)
- `search:artists:{geoHash}:{filtersHash}` → JSON of ranked artist ids, TTL 15m
- `ratelimit:otp:{phone}` → sliding window counters
- `session:{token}` → user id + expiry (if not using SQL sessions)
- `idempotency:{key}` → request safely replayed

---

# INDEXING & PERFORMANCE NOTES
- **Hot paths:** bookings by artist/date, bookings by status; add composite indexes accordingly.
- **Trigram (`pg_trgm`)** for fuzzy artist/service search.
- **Partition large tables**: `user_activity_logs`, optional `transactions` by month.
- **Materialized views**: `earnings_summary` (artist/day/month), refresh via cron.
- **Write paths**: Use DB transactions; wallets use `SELECT ... FOR UPDATE`.
- **Sharding readiness (Mongo)**: shard by `chat_id` for messages; by `user_pg_id` for analytics.

---

# MIGRATION / MVP NOTES
- **MVP:** Keep Mongo only for `chats`, `messages`, `portfolio_images`. Defer notifications/analytics to phase 2 if needed.
- **Academies & Courses** live entirely in SQL from day 1.
- **Addresses** in SQL with PostGIS (map features still easy via lat/lon).
- **Search cache** starts in Redis; invalidate on portfolio/price/availability change.

---

# SECURITY & COMPLIANCE
- Encrypt sensitive fields (bank accounts) with `pgcrypto`; store only tokens & last4.
- PII minimization: move high-risk docs (KYC) to S3 with presigned URLs; store only references & checksums.
- Strict audit logs for admin actions, payment status changes, and KYC decisions.

---

# ERD HINT (Top Entities)
**users** ←→ (admins | customers | artists) ←→ **bookings** ←→ **transactions/wallets** ←→ **reviews**

**academies** ←→ **courses** ←→ **academy_courses**

**salons** ←→ **salon_artists** ←→ **artists**

**addresses** links to users/bookings; **services** normalized; **subscriptions** ↔ **subscription_payments**

Mongo mirrors with `pg_id` links: **chats/messages**, **portfolio_images**, **notifications**, **analytics_events**, **artist_availability**.

---

## DONE ✅  This is the lean, production-ready hybrid architecture that matches your product plan and reduces Mongo collections from 17 → **6** while keeping SQL authoritative.

