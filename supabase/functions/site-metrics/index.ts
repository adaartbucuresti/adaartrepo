import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (payload: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, 500)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  const rawBody = await req.text().catch(() => '')
  let body: any = null
  if (rawBody) {
    try {
      body = JSON.parse(rawBody)
    } catch {
      body = null
    }
  }

  const action = String(body?.action || '').trim() || (req.method === 'POST' ? 'track' : '')
  if (!action) return json({ ok: false, error: 'Missing action' }, 400)

  const getClientIp = () => {
    const forwarded = req.headers.get('x-forwarded-for') || ''
    if (forwarded) return forwarded.split(',')[0]?.trim() || ''
    return (
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('true-client-ip') ||
      ''
    ).trim()
  }

  const sha256Hex = async (value: string) => {
    const buf = new TextEncoder().encode(value)
    const hash = await crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  if (action === 'track') {
    const ip = getClientIp()
    const ua = String(req.headers.get('user-agent') || '').slice(0, 500)
    if (!ip) return json({ ok: true, tracked: false }, 200)
    const ipHash = await sha256Hex(`${ip}|${Deno.env.get('SITE_METRICS_SALT') || ''}`)
    const nowIso = new Date().toISOString()

    const { error } = await supabaseAdmin.from('site_visitors').upsert(
      {
        ip_hash: ipHash,
        last_seen_at: nowIso,
        last_user_agent: ua || null,
      },
      { onConflict: 'ip_hash' },
    )
    if (error) return json({ ok: false, error: error.message }, 400)
    return json({ ok: true, tracked: true }, 200)
  }

  if (action === 'stats') {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return json({ ok: false, error: 'Missing bearer token' }, 401)

    const supabaseUser = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token)
    const user = userData?.user
    if (userError || !user) return json({ ok: false, error: 'Unauthorized' }, 401)

    const { data: profileRow, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) return json({ ok: false, error: profileError.message }, 400)
    if (profileRow?.role !== 'admin') return json({ ok: false, error: 'Forbidden' }, 403)

    const cutoff = new Date(Date.now() - 15_000).toISOString()

    const [{ count: onlineCount, error: onlineError }, { count: totalVisitors, error: visitorsError }, { count: totalAccounts, error: accountsError }] =
      await Promise.all([
        supabaseAdmin.from('site_visitors').select('id', { count: 'exact', head: true }).gte('last_seen_at', cutoff),
        supabaseAdmin.from('site_visitors').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      ])

    if (onlineError) return json({ ok: false, error: onlineError.message }, 400)
    if (visitorsError) return json({ ok: false, error: visitorsError.message }, 400)
    if (accountsError) return json({ ok: false, error: accountsError.message }, 400)

    return json(
      {
        ok: true,
        online_now: onlineCount || 0,
        visitors_total: totalVisitors || 0,
        accounts_total: totalAccounts || 0,
      },
      200,
    )
  }

  if (action === 'online') {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return json({ ok: false, error: 'Missing bearer token' }, 401)

    const supabaseUser = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token)
    const user = userData?.user
    if (userError || !user) return json({ ok: false, error: 'Unauthorized' }, 401)

    const { data: profileRow, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) return json({ ok: false, error: profileError.message }, 400)
    if (profileRow?.role !== 'admin') return json({ ok: false, error: 'Forbidden' }, 403)

    const cutoff = new Date(Date.now() - 15_000).toISOString()
    const { count, error } = await supabaseAdmin
      .from('site_visitors')
      .select('id', { count: 'exact', head: true })
      .gte('last_seen_at', cutoff)
    if (error) return json({ ok: false, error: error.message }, 400)

    return json({ ok: true, online_now: count || 0 }, 200)
  }

  return json({ ok: false, error: 'Unknown action' }, 400)
})
