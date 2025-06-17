-- Modify operator column to allow NULL values
ALTER TABLE operations ALTER COLUMN operator DROP NOT NULL; 