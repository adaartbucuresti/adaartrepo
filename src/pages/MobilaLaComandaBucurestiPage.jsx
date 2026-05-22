import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export default function MobilaLaComandaBucurestiPage() {
  const title = 'Mobilă la comandă în București | ADA ART MOB'
  const description =
    'Mobilă la comandă în București: configurator rapid, proiectare clară, ofertă, execuție și montaj pentru bucătării, dressinguri, living, dormitor, baie. Cere ofertă acum.'

  const canonicalUrl = useMemo(() => {
    return `https://adaart.ro/mobila-la-comanda-bucuresti/`
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const upsertMeta = (key, attr, content) => {
      const selector = `meta[${attr}="${key}"]`
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      const prev = el.getAttribute('content')
      el.setAttribute('content', content)
      return () => {
        if (prev === null) el.remove()
        else el.setAttribute('content', prev)
      }
    }

    const upsertLink = (rel, href) => {
      const selector = `link[rel="${rel}"]`
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        document.head.appendChild(el)
      }
      const prev = el.getAttribute('href')
      el.setAttribute('href', href)
      return () => {
        if (prev === null) el.remove()
        else el.setAttribute('href', prev)
      }
    }

    const cleanups = [
      upsertMeta('description', 'name', description),
      upsertLink('canonical', canonicalUrl),
      upsertMeta('og:title', 'property', title),
      upsertMeta('og:description', 'property', description),
      upsertMeta('og:url', 'property', canonicalUrl),
      upsertMeta('og:type', 'property', 'website'),
      upsertMeta('og:site_name', 'property', 'ADA ART MOB'),
      upsertMeta('og:image', 'property', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400'),
      upsertMeta('twitter:card', 'name', 'summary_large_image'),
      upsertMeta('twitter:title', 'name', title),
      upsertMeta('twitter:description', 'name', description),
      upsertMeta('twitter:image', 'name', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400'),
    ]

    return () => {
      document.title = previousTitle
      for (const fn of cleanups) {
        try {
          fn()
        } catch {
          void 0
        }
      }
    }
  }, [canonicalUrl])

  const configuratorUrl = '/configurator'
  const phoneDisplay = '+40 0722 648 175'
  const phoneTel = 'tel:+40722648175'

  const benefitCards = useMemo(
    () => [
      { title: 'Proiectare clară', text: 'Structură gândită pentru spațiul tău, cu o propunere ușor de înțeles.' },
      { title: 'Materiale potrivite', text: 'Alegem opțiuni corecte pentru buget, utilizare și întreținere.' },
      { title: 'Execuție + montaj', text: 'Realizăm și montăm în București, cu verificare și reglaje la final.' },
      { title: 'Comunicare rapidă', text: 'Răspundem clar și ținem aproape de tine pe tot parcursul.' },
    ],
    [],
  )

  const steps = useMemo(
    () => [
      {
        title: 'Discuție inițială',
        text: 'Telefon/WhatsApp/email pentru nevoi, stil și buget. Varianta rapidă: cerere în configurator (tip produs, dimensiuni, preferințe, poze).',
      },
      { title: 'Clarificări + măsurători', text: 'Stabilim dimensiuni corecte; ne deplasăm în București când e cazul.' },
      { title: 'Propunere / proiect', text: 'Schiță sau proiectare 3D, care sa se potriveasca proiectului.' },
      { title: 'Ofertă + confirmare', text: 'Primești ofertă clară și confirmăm varianta finală.' },
      { title: 'Execuție + montaj', text: 'Execuție în atelier, apoi montaj și verificare finală.' },
    ],
    [],
  )

  const zones = useMemo(
    () => [
      'Sector 1',
      'Sector 2',
      'Sector 3',
      'Sector 4',
      'Sector 5',
      'Sector 6',
      'Voluntari',
      'Pipera',
      'Tunari',
      'Otopeni',
      'Mogoșoaia',
      'Chitila',
      'Buftea',
      'Popești-Leordeni',
      'Bragadiru',
      'Chiajna',
      'Domnești',
      'Pantelimon',
    ],
    [],
  )

  const faq = useMemo(
    () => [
      { q: 'Cât durează execuția?', a: 'Depinde de proiect și materiale. Comunicăm un termen estimativ între 5-30 zile.' },
      { q: 'Cum se fac măsurătorile?', a: 'Ne deplasăm în București când e cazul, ca să confirmăm dimensiunile corecte.' },
      { q: 'Se plătește avans?', a: 'Condițiile se stabilesc în etapa de ofertare, în funcție de proiect.' },
      { q: 'Ce garanție oferiți?', a: 'Oferim 2 ani de garanție (24 luni).' },
      { q: 'Montajul e inclus?', a: 'Da, montajul și transportul în general este inclus în preț.' },
      { q: 'Ce îmi trebuie pentru configurator?', a: 'Tip produs, dimensiuni aproximative și poze/inspirație (dacă ai).' },
    ],
    [],
  )
  const [openFaq, setOpenFaq] = useState(0)
  const [portfolioPreview, setPortfolioPreview] = useState([])
  const [portfolioPreviewLoading, setPortfolioPreviewLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const shuffle = (arr) => {
      const next = [...arr]
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
      }
      return next
    }
    const load = async () => {
      setPortfolioPreviewLoading(true)
      if (!isSupabaseConfigured) {
        setPortfolioPreview([])
        setPortfolioPreviewLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('id,image_url')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (!alive) return
      if (error) {
        setPortfolioPreview([])
        setPortfolioPreviewLoading(false)
        return
      }
      const urls = (Array.isArray(data) ? data : [])
        .map((x) => String(x?.image_url || '').trim())
        .filter(Boolean)
      setPortfolioPreview(shuffle(urls).slice(0, 9))
      setPortfolioPreviewLoading(false)
    }
    Promise.resolve().then(load)
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="bg-cream">
      <div className="bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(74,93,78,0.10),transparent_55%),radial-gradient(900px_circle_at_95%_20%,rgba(198,139,89,0.10),transparent_55%),linear-gradient(to_bottom,#F6F2EE,#FFFFFF)]">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="text-sm text-text-muted">
            <Link className="hover:text-brand-mid" to="/">
              Acasă
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-dark">Mobilă la comandă București</span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 className="max-w-3xl font-heading text-4xl font-semibold text-text-dark md:text-5xl">
                Mobilă la comandă în București
              </h1>
              <div className="mt-3 max-w-[680px] text-sm leading-relaxed text-text-muted md:text-base">
                Cerere rapidă în configurator, apoi proiectare, ofertă și montaj în București — fără texte lungi, doar pași clari.
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to={configuratorUrl}
                  className="inline-flex items-center justify-center rounded-full bg-brand-mid px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                >
                  Deschide configuratorul
                </Link>
                <a
                  href={phoneTel}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-text-dark transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                >
                  Sună acum
                </a>
              </div>

              <div className="mt-3 text-xs text-text-muted">
                Telefon: <span className="font-semibold text-text-dark">{phoneDisplay}</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {benefitCards.map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl border border-border bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-softLg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-primary/15">
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-mid" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-dark">{c.title}</div>
                        <div className="mt-1 text-xs leading-relaxed text-text-muted">{c.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-dark">Cum pregătim comanda</h2>
              <div className="mt-5 grid gap-3">
                {steps.map((s, idx) => (
                  <div
                    key={s.title}
                    className="rounded-2xl border border-border bg-cream px-5 py-4 transition hover:bg-brand-light"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-border">
                        <span className="text-xs font-semibold text-text-dark">{idx + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-dark">{s.title}</div>
                        <div className="mt-1 text-xs leading-relaxed text-text-muted">{s.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-dark">Portofoliu</h2>
              <div className="mt-5">
                {portfolioPreviewLoading ? (
                  <div className="rounded-2xl border border-border bg-cream px-5 py-4 text-sm text-text-muted">
                    Se încarcă…
                  </div>
                ) : portfolioPreview.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-cream px-5 py-4 text-sm text-text-muted">
                    Nu există imagini în portofoliu încă.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {portfolioPreview.map((url, idx) => (
                      <Link
                        key={`${url}-${idx}`}
                        to="/portofoliu"
                        className="group relative block overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-softLg"
                        aria-label="Vezi portofoliul"
                      >
                        <img
                          src={url}
                          alt=""
                          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <LogoWatermark />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-5 flex justify-center">
                <Link
                  to="/portofoliu"
                  className="relative inline-flex items-center justify-center text-sm font-semibold text-brand-mid transition focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                >
                  <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-brand-mid after:transition-transform after:duration-300 hover:after:scale-x-100">
                    Vezi intregul portofoliu
                  </span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-dark">Întrebări frecvente</h2>
              <div className="mt-4 grid gap-3">
                {faq.map((x, idx) => {
                  const open = openFaq === idx
                  const buttonId = `faq-btn-${idx}`
                  const panelId = `faq-panel-${idx}`
                  return (
                    <div key={x.q} className="rounded-2xl border border-border bg-cream">
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenFaq((v) => (v === idx ? -1 : idx))}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text-dark transition hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                      >
                        <span className="min-w-0">{x.q}</span>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-border">
                          <span className="text-base leading-none">{open ? '−' : '+'}</span>
                        </span>
                      </button>
                      {open ? (
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          className="px-5 pb-4 text-sm leading-relaxed text-text-muted"
                        >
                          {x.a}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,#FFFFFF,#FBF6F0_40%,#F3F7F3)] p-6 shadow-soft">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_0%,rgba(198,139,89,0.28),transparent_55%),radial-gradient(900px_circle_at_98%_18%,rgba(74,93,78,0.22),transparent_55%),radial-gradient(700px_circle_at_50%_110%,rgba(255,255,255,0.8),transparent_60%)]"
              />
              <div className="relative">
                <h2 className="font-heading text-2xl font-semibold text-text-dark">Zone în care livrăm și montăm</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {zones.map((z) => (
                    <button
                      key={z}
                      type="button"
                      className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-dark transition hover:scale-[1.02] hover:border-brand-primary/30 hover:bg-brand-light hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                    >
                      {z}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-text-muted">
                  Dacă nu te regăsești pe listă, scrie-ne și îți confirmăm disponibilitatea.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
