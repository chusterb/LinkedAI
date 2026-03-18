import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  // Ping Supabase toutes les 12h pour éviter la mise en veille
  const supabase = createClient()
  await supabase.from('posts_history').select('id').limit(1)
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
