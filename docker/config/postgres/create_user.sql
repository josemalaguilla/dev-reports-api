-- Create a new user with password
CREATE USER developeruser WITH PASSWORD 'DeveloperPassword1';

-- Grant the user connection privileges only to 'dev_reports_database'
GRANT CONNECT ON DATABASE dev_reports_database TO developeruser;

-- Switch to 'dev_reports_database' to set schema-level permissions
\c dev_reports_database;

-- Grant read/write permissions to the new user on 'dev_reports_database' schema
GRANT USAGE, CREATE ON SCHEMA public TO developeruser;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO developeruser;

-- Ensure the user can manage sequences (if needed)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO developeruser;

-- Optionally, future tables and sequences can inherit these privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO developeruser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO developeruser;
