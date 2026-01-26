-- Enable RLS on wishes table
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Allow users to create wishes
CREATE POLICY "wishes_insert_policy" 
ON wishes FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Allow users to view all active wishes
CREATE POLICY "wishes_select_policy" 
ON wishes FOR SELECT 
TO authenticated 
USING (status = 'ACTIVE' OR user_id = auth.uid());

-- Allow users to update their own wishes
CREATE POLICY "wishes_update_policy" 
ON wishes FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Allow users to delete their own wishes
CREATE POLICY "wishes_delete_policy" 
ON wishes FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());
