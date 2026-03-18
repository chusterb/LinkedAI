import { createClient } from '@supabase/supabase-js'

// Client avec service role — bypass RLS, utiliser UNIQUEMENT côté serveur (webhooks, cron)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
