-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL, -- 'MESSAGE', 'EXCHANGE_PROPOSAL', 'EXCHANGE_UPDATE', 'SYSTEM'
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- Enable RLS
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own notifications
CREATE POLICY "Users can view their own notifications" ON "notifications"
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users (or system) can insert notifications (broad for now to allow triggering from other users actions)
-- In a stricter system, maybe only functions/triggers create them, but for MVP API triggers are fine if authenticated.
CREATE POLICY "Users can insert notifications" ON "notifications"
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON "notifications"
    FOR UPDATE USING (auth.uid() = user_id);
