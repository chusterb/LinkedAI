import { z } from 'zod'

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  LEMONSQUEEZY_API_KEY: z.string().min(1, 'LEMONSQUEEZY_API_KEY is required'),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(1, 'LEMONSQUEEZY_WEBHOOK_SECRET is required'),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
})

function validateEnv<T>(schema: z.ZodType<T>, values: unknown, context: string): T {
  const result = schema.safeParse(values)
  if (!result.success) {
    const issues = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`[${context}] Missing or invalid environment variables:\n${issues}`)
  }
  return result.data
}

// Server-side env (call only in server components / API routes)
export function getServerEnv() {
  return validateEnv(serverEnvSchema, process.env, 'server')
}

// Client-side env (safe to call in client components)
export function getClientEnv() {
  return validateEnv(clientEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }, 'client')
}
