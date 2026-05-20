import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function MobilaLaComandaBucurestiPage() {
  const title = 'Mobilă la comandă în București | ADA ART MOB'
  const description =
    'Mobilă la comandă în București cu proiectare și montaj. Folosește configuratorul și cere ofertă — îți răspundem rapid cu pașii următori.'

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://adaart.ro'
    return `${origin}/mobila-la-comanda-bucuresti/`
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
      upsertMeta('twitter:card', 'name', 'summary_large_image'),
      upsertMeta('twitter:title', 'name', title),
      upsertMeta('twitter:description', 'name', description),
    ]

    return () => {
      document.title = previousTitle
      for (const fn of cleanups) {
        try {
          fn()
        } catch {
        }
      }
    }
  }, [canonicalUrl])

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

  return (
    <div className="bg-cream">
      <div className="bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(74,93,78,0.10),transparent_55%),radial-gradient(900px_circle_at_95%_20%,rgba(198,139,89,0.10),transparent_55%),linear-gradient(to_bottom,#F6F2EE,#FFFFFF)]">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="text-sm text-text-muted">
            <Link className="hover:text-brand-mid" to="/">
              Comenzi
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-dark">Mobilă la comandă București</span>
          </div>

          <h1 className="mt-5 max-w-3xl font-heading text-4xl font-semibold text-text-dark md:text-5xl">
            Mobilă la comandă în București
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted md:text-base">
            Realizăm mobilă la comandă în București pentru locuințe și spații comerciale, cu accent pe funcționalitate și
            un design care se potrivește spațiului tău. Lucrăm pe baza dimensiunilor reale, astfel încât mobilierul să fie
            ușor de folosit zi de zi și să arate bine pe termen lung.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted md:text-base">
            Poți porni rapid cu o cerere în configurator (câteva detalii și preferințe), iar noi revenim cu întrebările
            necesare, propunerea și oferta. Dacă ai deja o schiță, un link de inspirație sau poze din spațiu, le poți
            atașa în cerere.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted md:text-base">
            Pentru proiecte care necesită confirmare la fața locului, ne deplasăm în București când este cazul, ca să
            stabilim corect dimensiunile și detaliile de montaj înainte de execuție.
          </p>

          <div className="mt-10 grid gap-6">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-dark">Cum pregătim o comandă</h2>
              <div className="mt-4 grid gap-4 text-sm leading-relaxed text-text-muted">
                <p>
                  Dacă ai ajuns aici, înseamnă că vrei mobilă la comandă în București și cauți o echipă care să explice
                  clar ce se întâmplă, pas cu pas. Îți spunem pe scurt cum arată o zi „reală” din proiectele noastre — ca
                  un jurnal de atelier, dar cu pași concreți. Nu e magie: e organizare, atenție la detalii și comunicare
                  bună.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">1) Discuția inițială (telefon / WhatsApp / email):</span>{' '}
                  începem cu întrebările simple: ce tip de mobilier vrei, unde va fi montat, ce stil îți place și ce
                  buget ai în minte. Nu îți cerem „să știi tot” de la început — ne interesează să înțelegem prioritățile
                  tale: depozitare, aspect, rezistență, ușurință la curățare sau încadrare într-un spațiu dificil.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">2) Varianta rapidă: configuratorul de pe site:</span>{' '}
                  dacă vrei să te miști repede, folosești configuratorul. Acolo colectăm informațiile care contează
                  pentru o ofertă: tipul de produs (bucătărie, dressing, living, dormitor, baie, birou), dimensiuni
                  aproximative, material/finisaj preferat și orice detaliu util. Dacă ai poze, o schiță sau un link de
                  inspirație, le atașezi și ne ajută mult.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">3) Clarificări și măsurători:</span> după ce vedem cererea,
                  revenim cu întrebări scurte ca să eliminăm ambiguitățile (de exemplu: deschideri, poziția prizelor,
                  țevi, plinte, colțuri). Pentru proiectele unde e nevoie, ne deplasăm în București ca să stabilim corect
                  dimensiunile și condițiile de montaj. Preferăm să verificăm înainte, ca să nu apară surprize în ziua
                  instalării.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">4) Propunere / proiectare:</span> când proiectul o cere,
                  lucrăm pe o propunere clară (inclusiv proiectare 3D). Aici se vede cum se așază compartimentările și
                  cum arată fronturile, mânerele, zonele de depozitare și accesul. Ajustăm împreună până când varianta
                  finală are sens și pentru spațiu, și pentru utilizarea zilnică.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">5) Oferta și confirmarea comenzii:</span> oferta se
                  stabilește în funcție de dimensiuni, materiale, feronerie și complexitate. Îți explicăm clar ce este
                  inclus (execuție, livrare, montaj) și ce opțiuni ai dacă vrei să optimizezi costul fără să sacrifici
                  calitatea. Confirmarea se face după ce avem o variantă stabilă, ca să știm exact ce executăm.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">6) Execuția în atelier:</span> aici intrăm în „partea de
                  lucru” — pregătirea materialelor, tăiere, cant și asamblare, cu verificări pe parcurs. Folosim
                  materiale și feronerie potrivite proiectului, fără promisiuni exagerate și fără să inventăm branduri.
                  Scopul e să obținem un mobilier care arată bine și se comportă bine în timp.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">7) Montaj și predare:</span> livrăm în București și montăm
                  piesele, apoi facem reglajele finale (aliniere, închideri, uși/sertare) și verificăm funcționarea.
                  La final, îți lăsăm recomandări simple de întreținere, ca mobilierul să rămână într-o formă bună cât
                  mai mult timp.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-brand-light p-6 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-dark">Cere ofertă rapid</h2>
              <div className="mt-3 text-sm leading-relaxed text-text-muted">
                Cel mai rapid este prin configurator. Alternativ, ne poți scrie din pagina de contact.
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/configurator"
                  className="inline-flex items-center justify-center rounded-full bg-brand-mid px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary"
                >
                  Deschide configuratorul
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-text-dark transition hover:bg-cream"
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
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-dark transition hover:border-brand-primary/30 hover:bg-brand-light hover:shadow-soft"
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
