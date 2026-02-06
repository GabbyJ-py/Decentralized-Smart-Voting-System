-- Migration: Add has_voted column to existing database
-- Run this if you already have a voter_db database with data

USE voter_db;

-- Add has_voted column if it doesn't exist
ALTER TABLE registered_voter 
ADD COLUMN IF NOT EXISTS has_voted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add registration_date column if it doesn't exist
ALTER TABLE registered_voter 
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_voter_id ON registered_voter(voter_id);
CREATE INDEX IF NOT EXISTS idx_aadhaar ON registered_voter(aadhaar);
CREATE INDEX IF NOT EXISTS idx_email ON registered_voter(email);
CREATE INDEX IF NOT EXISTS idx_has_voted ON registered_voter(has_voted);

-- Verify the changes
DESCRIBE registered_voter;
