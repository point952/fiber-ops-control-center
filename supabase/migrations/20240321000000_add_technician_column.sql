-- Add technician column to operations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'operations' 
        AND column_name = 'technician'
    ) THEN
        ALTER TABLE operations ADD COLUMN technician TEXT;
    END IF;
END $$;

-- Update existing records to use technician_id as technician
UPDATE operations SET technician = technician_id::text WHERE technician IS NULL;

-- Make the column NOT NULL after updating existing records
ALTER TABLE operations ALTER COLUMN technician SET NOT NULL;

-- Add unique constraint to prevent duplicates
ALTER TABLE operations ADD CONSTRAINT unique_operation_technician UNIQUE (id, technician_id);

-- Clean up any duplicate operations
DELETE FROM operations a USING operations b
WHERE a.id > b.id
AND a.technician_id = b.technician_id
AND a.type = b.type
AND a.data = b.data; 