
-- Create the necessary tables for our operations system

-- Operations Table
CREATE TABLE IF NOT EXISTS public.operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT NOT NULL,
  technician TEXT NOT NULL,
  technician_id UUID REFERENCES auth.users(id),
  feedback TEXT,
  technician_response TEXT,
  assigned_operator TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- History Table
CREATE TABLE IF NOT EXISTS public.operation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  technician TEXT NOT NULL,
  technician_id UUID REFERENCES auth.users(id),
  operator TEXT,
  feedback TEXT,
  technician_response TEXT
);

-- Add RLS policies for operations table
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Admin can see all operations
CREATE POLICY "Admins can view all operations" ON public.operations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Operators can view all operations
CREATE POLICY "Operators can view all operations" ON public.operations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  );

-- Technicians can view only their own operations
CREATE POLICY "Technicians can view own operations" ON public.operations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'technician' AND profiles.id = operations.technician_id
    )
  );

-- Admin can insert operations
CREATE POLICY "Admins can insert operations" ON public.operations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Operators can insert operations
CREATE POLICY "Operators can insert operations" ON public.operations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  );

-- Technicians can insert operations
CREATE POLICY "Technicians can insert operations" ON public.operations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'technician'
    )
  );

-- Admin can update operations
CREATE POLICY "Admins can update operations" ON public.operations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Operators can update operations
CREATE POLICY "Operators can update operations" ON public.operations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  );

-- Technicians can update their own operations
CREATE POLICY "Technicians can update own operations" ON public.operations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'technician' AND profiles.id = operations.technician_id
    )
  );

-- Add RLS policies for history table
ALTER TABLE public.operation_history ENABLE ROW LEVEL SECURITY;

-- Admin can see all history
CREATE POLICY "Admins can view all history" ON public.operation_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Operators can view all history
CREATE POLICY "Operators can view all history" ON public.operation_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  );

-- Technicians can view only their own history
CREATE POLICY "Technicians can view own history" ON public.operation_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'technician' AND profiles.id = operation_history.technician_id
    )
  );

-- Admin can insert history records
CREATE POLICY "Admins can insert history" ON public.operation_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Operators can insert history records
CREATE POLICY "Operators can insert history" ON public.operation_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  );

-- RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admin can insert/update profiles
CREATE POLICY "Admin can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) 
    OR 
    auth.uid() = id  -- Allow users to create their own profile (needed for registration)
  );

CREATE POLICY "Admin can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
