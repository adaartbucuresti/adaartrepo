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

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) {
    return json({ ok: false, error: 'Missing bearer token' }, 401)
  }

  const supabaseUser = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  const { data: userData, error: userError } = await supabaseUser.auth.getUser(token)
  const user = userData?.user
  if (userError || !user) {
    return json({ ok: false, error: 'Unauthorized' }, 401)
  }

  const email = String(user.email || '').trim().toLowerCase()

  if (email) {
    const { error } = await supabaseAdmin.from('configurator_requests').delete().eq('client_email', email)
    if (error) {
      return json({ ok: false, error: error.message }, 400)
    }
  }

  {
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', user.id)
    if (error) {
      return json({ ok: false, error: error.message }, 400)
    }
  }

  {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (error) {
      return json({ ok: false, error: error.message }, 400)
    }
  }

  return json({ ok: true }, 200)
})
