import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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
  const contactUrl = '/contact'
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
      { title: 'Discuție inițială', text: 'Telefon/WhatsApp/email pentru nevoi, stil și buget.' },
      { title: 'Cerere în configurator', text: 'Varianta rapidă: tip produs, dimensiuni, preferințe, poze.' },
      { title: 'Clarificări + măsurători', text: 'Stabilim dimensiuni corecte; ne deplasăm în București când e cazul.' },
      { title: 'Propunere / proiect', text: 'Schiță sau proiectare 3D, dacă se potrivește proiectului.' },
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

  const portfolio = useMemo(
    () => [
      { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200', alt: 'mobilă la comandă București' },
      { src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200', alt: 'living la comandă București' },
      { src: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200', alt: 'dormitor la comandă București' },
      { src: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200', alt: 'birou la comandă București' },
      { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', alt: 'dressing la comandă București' },
      { src: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200', alt: 'mobilă baie la comandă București' },
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

            <div className="rounded-2xl border border-border bg-brand-light p-6 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-dark">Cere ofertă rapid</h2>
              <div className="mt-2 max-w-[720px] text-sm text-text-muted">
                Completezi configuratorul și revenim cu întrebările necesare și oferta.
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to={configuratorUrl}
                  className="inline-flex items-center justify-center rounded-full bg-brand-mid px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                >
                  Cere ofertă
                </Link>
                <Link
                  to={contactUrl}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-text-dark transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-dark">Portofoliu</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.map((img) => (
                  <div key={img.src} className="overflow-hidden rounded-2xl border border-border bg-cream">
                    <img src={img.src} alt={img.alt} loading="lazy" className="h-44 w-full object-cover" />
                  </div>
                ))}
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

            <div className="rounded-2xl border border-border bg-[radial-gradient(900px_circle_at_20%_0%,rgba(74,93,78,0.10),transparent_60%),radial-gradient(900px_circle_at_95%_20%,rgba(198,139,89,0.10),transparent_60%),linear-gradient(to_bottom,#F6F2EE,#FFFFFF)] p-8 shadow-soft">
              <div className="font-heading text-2xl font-semibold text-text-dark">Ești gata să ceri o ofertă?</div>
              <div className="mt-2 max-w-[720px] text-sm text-text-muted">
                Trimite cererea în configurator și revenim cu pașii următori.
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to={configuratorUrl}
                  className="inline-flex items-center justify-center rounded-full bg-brand-mid px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                >
                  Cere ofertă
                </Link>
                <Link
                  to={contactUrl}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-text-dark transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
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
  )
}
