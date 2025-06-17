-- Enable realtime for operations table
ALTER PUBLICATION supabase_realtime ADD TABLE operations;

-- Enable realtime for operation_history table
ALTER PUBLICATION supabase_realtime ADD TABLE operation_history; 