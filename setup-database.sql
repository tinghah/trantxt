-- TranTxt Database Setup Script
-- PostgreSQL 18

-- Create database
CREATE DATABASE trantxt;

-- Create user
CREATE USER trantxt_user WITH PASSWORD 'secure_password_123';

-- Set role options
ALTER ROLE trantxt_user SET client_encoding TO 'utf8';
ALTER ROLE trantxt_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE trantxt_user SET default_transaction_deferrable TO on;
ALTER ROLE trantxt_user SET default_transaction_read_only TO off;
ALTER ROLE trantxt_user SET timezone TO 'UTC';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE trantxt TO trantxt_user;

-- Connect to database and grant schema privileges
\c trantxt
GRANT ALL ON SCHEMA public TO trantxt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO trantxt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO trantxt_user;

-- Verify setup
SELECT version();
SELECT usename FROM pg_user WHERE usename = 'trantxt_user';
SELECT datname FROM pg_database WHERE datname = 'trantxt';
