-- Atomic rate-limit check + insert for generation_logs.
-- Returns TRUE if the insert succeeded (under limit), FALSE if the daily limit was reached.
-- This prevents race conditions where concurrent requests bypass the daily limit.
CREATE OR REPLACE FUNCTION check_and_log_generation(
  p_user_id UUID,
  p_daily_limit INT DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today_start TIMESTAMPTZ := date_trunc('day', now() AT TIME ZONE 'UTC');
  v_count INT;
BEGIN
  -- Lock the user's rows for the day to prevent concurrent inserts
  SELECT COUNT(*) INTO v_count
  FROM generation_logs
  WHERE user_id = p_user_id
    AND created_at >= v_today_start
  FOR UPDATE;

  IF v_count >= p_daily_limit THEN
    RETURN FALSE;
  END IF;

  INSERT INTO generation_logs (user_id) VALUES (p_user_id);
  RETURN TRUE;
END;
$$;
