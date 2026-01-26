-- Enable RLS on offers table (if not already enabled)
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can create offers
CREATE POLICY "Users can create offers" 
ON offers FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own offers
CREATE POLICY "Users can update own offers" 
ON offers FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own offers
CREATE POLICY "Users can delete own offers" 
ON offers FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Everyone can view active offers (including anonymous/public if we wanted, but let's stick to auth for now)
CREATE POLICY "Everyone can view active offers" 
ON offers FOR SELECT 
TO authenticated 
USING (true);
