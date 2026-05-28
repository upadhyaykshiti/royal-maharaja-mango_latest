import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALL_KEYS = [
  'orders_open',
  'kesar_home_open',
  'kesar_courier_open',
  'alphonso_open',
  'banganapalli_open',
  'totapuri_open',
  'jumbo_kesar_open',
]

function isAuthed(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value
  const secret = process.env.ADMIN_SESSION_SECRET || 'rmm_admin_secret'
  return session === secret
}

// GET — public, returns all toggle states
export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ALL_KEYS)

  // Default all to true if missing
  const result: Record<string, boolean> = {}
  ALL_KEYS.forEach(k => { result[k] = true })
  // Legacy compat: if old kesar_open exists, mirror it
  // (new keys kesar_home_open / kesar_courier_open take precedence)

  if (!error && data) {
    data.forEach((row: { key: string; value: string }) => {
      result[row.key] = row.value !== 'false'
    })
  }

  return NextResponse.json(result)
}

// POST — admin only, upsert one or many settings
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // body can be { key: 'kesar_open', value: false }
  // or bulk { orders_open: true, kesar_open: false, ... }
  const rows: { key: string; value: string; updated_at: string }[] = []
  const now = new Date().toISOString()

  if (body.key && typeof body.value === 'boolean') {
    // Single key update
    rows.push({ key: body.key, value: body.value ? 'true' : 'false', updated_at: now })
  } else {
    // Bulk update — iterate all known keys present in body
    ALL_KEYS.forEach(k => {
      if (typeof body[k] === 'boolean') {
        rows.push({ key: k, value: body[k] ? 'true' : 'false', updated_at: now })
      }
    })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })
  }

  const { error } = await supabase.from('settings').upsert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
