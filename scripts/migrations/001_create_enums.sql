-- Enum definitions for core domain
CREATE TYPE student_status AS ENUM ('active','inactive');
CREATE TYPE bill_status AS ENUM ('unpaid','partial','paid');
CREATE TYPE payment_method AS ENUM ('qris','tunai');
CREATE TYPE payment_status AS ENUM ('pending','verified','rejected');
CREATE TYPE cash_flow_kind AS ENUM ('in','out');
CREATE TYPE cash_source AS ENUM ('qris','tunai','lain-lain');
