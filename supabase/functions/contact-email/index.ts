import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (payload: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const brevoApiKey = Deno.env.get('BREVO_API_KEY') || ''
    if (!brevoApiKey) return json({ ok: false, error: 'Missing BREVO_API_KEY' }, 500)

    const toEmail = Deno.env.get('CONTACT_TO_EMAIL') || 'mobdesign.ro@outlook.com'
    const fromEmail = Deno.env.get('CONTACT_FROM_EMAIL') || 'mobdesign.ro@outlook.com'
    const fromName = Deno.env.get('CONTACT_FROM_NAME') || 'ADA ART'

    const body = await req.json().catch(() => null)
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const phone = String(body?.phone || '').trim()
    const message = String(body?.message || '').trim()

    if (!name || !email || !message) return json({ ok: false, error: 'Missing required fields' }, 400)
    if (name.length > 120) return json({ ok: false, error: 'Name too long' }, 400)
    if (email.length > 254) return json({ ok: false, error: 'Email too long' }, 400)
    if (phone.length > 40) return json({ ok: false, error: 'Phone too long' }, 400)
    if (message.length > 4000) return json({ ok: false, error: 'Message too long' }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Invalid email' }, 400)

    const safe = (v: string) =>
      v
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')

    const htmlContent = `
      <div style="font-family: ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial; background:#f6f2ee; padding:20px;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e7ded6;border-radius:16px;overflow:hidden;">
          <div style="padding:16px 18px;background:#f5f3ef;border-bottom:1px solid #eee3da;">
            <div style="font-weight:800;color:#0f2f2a;">ADA ART</div>
            <div style="margin-top:6px;font-size:18px;font-weight:800;color:#0f2f2a;">Mesaj nou din formularul de contact</div>
          </div>
          <div style="padding:18px;">
            <div style="font-size:13px;color:#374151;line-height:1.55;">
              <div><strong>Nume:</strong> ${safe(name)}</div>
              <div><strong>Email:</strong> ${safe(email)}</div>
              ${phone ? `<div><strong>Telefon:</strong> ${safe(phone)}</div>` : ''}
              <div style="margin-top:14px;"><strong>Mesaj:</strong></div>
              <div style="margin-top:6px;white-space:pre-wrap;background:#f5f3ef;border:1px solid #eadfd6;padding:12px 14px;border-radius:12px;">${safe(
                message,
              )}</div>
            </div>
          </div>
        </div>
        <div style="max-width:720px;margin:10px auto 0;font-size:12px;color:#6b7280;line-height:1.5;">
          Acest mesaj a fost trimis automat de pe formularul de contact.
        </div>
      </div>
    `

    const subject = `Contact site: ${name}`

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: toEmail }],
        replyTo: { name, email },
        subject,
        htmlContent,
        textContent: `Nume: ${name}\nEmail: ${email}\nTelefon: ${phone}\n\nMesaj:\n${message}`,
      }),
    })

    const out = await response.json().catch(() => null)
    if (!response.ok) {
      return json({ ok: false, error: out?.message || 'Brevo request failed' }, 400)
    }

    return json({ ok: true }, 200)
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

