-- Add operator column to operations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'operations' 
        AND column_name = 'operator'
    ) THEN
        ALTER TABLE operations ADD COLUMN operator TEXT;
    END IF;
END $$;

-- Update existing records to use assigned_operator as operator
UPDATE operations SET operator = assigned_operator WHERE operator IS NULL;

-- Set a default value for any remaining null values
UPDATE operations SET operator = 'Não atribuído' WHERE operator IS NULL;

-- Now make the column NOT NULL
ALTER TABLE operations ALTER COLUMN operator SET NOT NULL; 