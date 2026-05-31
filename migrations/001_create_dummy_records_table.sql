/**
 * Supabase Database Migration: Create dummy_records table
 * 
 * Run this migration in your Supabase dashboard:
 * 1. Go to SQL Editor
 * 2. Create a new query
 * 3. Paste this entire file
 * 4. Click "Execute"
 */

-- Create dummy_records table for database keep-alive functionality
CREATE TABLE IF NOT EXISTS dummy_records (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  metadata TEXT,
  is_dummy BOOLEAN DEFAULT true NOT NULL
);

-- Create index on created_at for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_dummy_records_created_at 
ON dummy_records(created_at);

-- Create index on is_dummy for faster filtering
CREATE INDEX IF NOT EXISTS idx_dummy_records_is_dummy 
ON dummy_records(is_dummy);

-- Enable RLS (Row Level Security) with service role bypass
ALTER TABLE dummy_records ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow service role (admin) to perform all operations
CREATE POLICY "Service role has full access"
ON dummy_records
FOR ALL
USING (true)
WITH CHECK (true)
TO authenticated;

-- Create policy: Allow anon role to read only (optional)
CREATE POLICY "Anon role can read"
ON dummy_records
FOR SELECT
USING (true)
TO anon;

-- Add comment to table for documentation
COMMENT ON TABLE dummy_records IS 'Table for storing temporary dummy records to keep the database active and prevent auto-deletion';
