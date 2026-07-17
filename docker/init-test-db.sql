-- Runs once on first container boot to provision the dedicated test database.
-- The main "dealership" database is created via POSTGRES_DB.
CREATE DATABASE dealership_test;
