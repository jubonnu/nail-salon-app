/*
  # ネイルサロン基本スキーマ作成

  1. 新規テーブル
    - customers (顧客情報)
      - id (uuid, primary key)
      - name (text, 氏名)
      - email (text, メールアドレス)
      - phone (text, 電話番号)
      - birthday (date, 誕生日)
      - notes (text, 備考)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - counseling_sheets (カウンセリングシート)
      - id (uuid, primary key)
      - customer_id (uuid, 顧客ID)
      - service_type (text, 施術タイプ)
      - nail_length (text, 爪の長さ)
      - nail_shape (text, 爪の形)
      - has_allergies (boolean, アレルギーの有無)
      - allergies_details (text, アレルギー詳細)
      - has_medical_conditions (boolean, 既往歴の有無)
      - medical_details (text, 既往歴詳細)
      - notes (text, 備考)
      - status (text, ステータス)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - appointments (予約情報)
      - id (uuid, primary key)
      - customer_id (uuid, 顧客ID)
      - staff_id (uuid, スタッフID)
      - service_type (text, 施術タイプ)
      - start_time (timestamptz, 開始時間)
      - end_time (timestamptz, 終了時間)
      - status (text, ステータス)
      - notes (text, 備考)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - sales_records (売上記録)
      - id (uuid, primary key)
      - appointment_id (uuid, 予約ID)
      - customer_id (uuid, 顧客ID)
      - staff_id (uuid, スタッフID)
      - amount (integer, 金額)
      - payment_method (text, 支払方法)
      - status (text, ステータス)
      - notes (text, 備考)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - instagram_posts (Instagram投稿)
      - id (uuid, primary key)
      - image_url (text, 画像URL)
      - caption (text, キャプション)
      - hashtags (text[], ハッシュタグ)
      - scheduled_time (timestamptz, 予約投稿時間)
      - status (text, ステータス)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - staff (スタッフ情報)
      - id (uuid, primary key)
      - name (text, 氏名)
      - email (text, メールアドレス)
      - phone (text, 電話番号)
      - role (text, 役職)
      - skills (text[], 得意な施術)
      - start_date (date, 勤務開始日)
      - notes (text, 備考)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. インデックス
    - customers: email, phone
    - counseling_sheets: customer_id, status
    - appointments: customer_id, staff_id, start_time
    - sales_records: appointment_id, customer_id, staff_id
    - instagram_posts: scheduled_time, status
    - staff: email

  3. セキュリティ
    - すべてのテーブルでRLSを有効化
    - 認証済みユーザーのみアクセス可能
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create customers table
CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text,
    phone text,
    birthday date,
    notes text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customers_email_key UNIQUE (email),
    CONSTRAINT customers_phone_key UNIQUE (phone)
);

CREATE INDEX customers_email_idx ON customers (email);
CREATE INDEX customers_phone_idx ON customers (phone);

-- Create counseling_sheets table
CREATE TABLE counseling_sheets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_type text NOT NULL,
    nail_length text,
    nail_shape text,
    has_allergies boolean DEFAULT false,
    allergies_details text,
    has_medical_conditions boolean DEFAULT false,
    medical_details text,
    notes text,
    status text NOT NULL DEFAULT 'New',
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX counseling_sheets_customer_id_idx ON counseling_sheets (customer_id);
CREATE INDEX counseling_sheets_status_idx ON counseling_sheets (status);

-- Create staff table
CREATE TABLE staff (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text,
    role text NOT NULL,
    skills text[],
    start_date date NOT NULL,
    notes text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX staff_email_idx ON staff (email);

-- Create appointments table
CREATE TABLE appointments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_type text NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'Scheduled',
    notes text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_time_check CHECK (end_time > start_time)
);

CREATE INDEX appointments_customer_id_idx ON appointments (customer_id);
CREATE INDEX appointments_staff_id_idx ON appointments (staff_id);
CREATE INDEX appointments_start_time_idx ON appointments (start_time);

-- Create sales_records table
CREATE TABLE sales_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    amount integer NOT NULL CHECK (amount >= 0),
    payment_method text NOT NULL,
    status text NOT NULL DEFAULT 'Completed',
    notes text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX sales_records_appointment_id_idx ON sales_records (appointment_id);
CREATE INDEX sales_records_customer_id_idx ON sales_records (customer_id);
CREATE INDEX sales_records_staff_id_idx ON sales_records (staff_id);

-- Create instagram_posts table
CREATE TABLE instagram_posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url text NOT NULL,
    caption text,
    hashtags text[],
    scheduled_time timestamptz,
    status text NOT NULL DEFAULT 'Draft',
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX instagram_posts_scheduled_time_idx ON instagram_posts (scheduled_time);
CREATE INDEX instagram_posts_status_idx ON instagram_posts (status);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counseling_sheets_updated_at
    BEFORE UPDATE ON counseling_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_records_updated_at
    BEFORE UPDATE ON sales_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_posts_updated_at
    BEFORE UPDATE ON instagram_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read customers"
    ON customers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert customers"
    ON customers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
    ON customers FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read counseling sheets"
    ON counseling_sheets FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage counseling sheets"
    ON counseling_sheets FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read staff"
    ON staff FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage staff"
    ON staff FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read appointments"
    ON appointments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage appointments"
    ON appointments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read sales records"
    ON sales_records FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage sales records"
    ON sales_records FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read instagram posts"
    ON instagram_posts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage instagram posts"
    ON instagram_posts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);