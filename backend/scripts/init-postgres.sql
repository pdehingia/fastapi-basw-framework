-- PostgreSQL initialization script for Maya Platform
-- This script runs when the PostgreSQL container starts for the first time

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS maya_analytics;
CREATE SCHEMA IF NOT EXISTS maya_reporting;

-- Set default permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA maya_analytics TO postgres;
GRANT USAGE ON SCHEMA maya_reporting TO postgres;

-- Create a function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Maya Platform PostgreSQL initialization completed successfully';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, postgis, pgcrypto, pg_trgm';
    RAISE NOTICE 'Schemas created: maya_analytics, maya_reporting';
END
$$;