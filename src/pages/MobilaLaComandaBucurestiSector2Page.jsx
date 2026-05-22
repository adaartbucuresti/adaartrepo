import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products.js'

export default function MobilaLaComandaBucurestiSector2Page() {
  const title = 'Mobilă la comandă București Sector 2 | ADA ART MOB'
  const description =
    'Mobilă la comandă în Sector 2: proiectare 3D, montaj și ofertă. Realizăm bucătării, dressinguri și mobilier complet, cu soluții adaptate spațiului.'

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://adaart.ro'
    return `${origin}/mobila-la-comanda-bucuresti-sector-2/`
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
        }
      }
    }
  }, [canonicalUrl])

  const portfolioItems = useMemo(() => {
    const sources = [
      ...products.flatMap((p) => (Array.isArray(p.images) ? p.images : [p.image]).filter(Boolean)),
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200',
    ]
    const unique = Array.from(new Set(sources))
    return unique.slice(0, 9).map((src, idx) => ({
      src,
      alt: [
        'mobilă living la comandă Sector 2',
        'bucătărie la comandă Sector 2 București',
        'dressing la comandă Sector 2',
        'mobilă dormitor la comandă Sector 2',
        'mobilă baie la comandă Sector 2',
        'birou la comandă Sector 2',
        'TV wall la comandă Sector 2',
        'mobilă la comandă București Sector 2',
        'mobilier personalizat Sector 2',
      ][idx] || 'mobilă la comandă Sector 2',
    }))
  }, [])

  const faq = useMemo(
    () => [
      {
        q: 'Care este termenul de execuție pentru mobilă la comandă?',
        a: 'Termenul depinde de tipul proiectului, materialele alese și complexitate. După măsurători și proiectarea 3D, îți comunicăm un termen estimativ înainte de a începe execuția.',
      },
      {
        q: 'Cum se face măsurătoarea în Sector 2?',
        a: 'Stabilim o vizită pentru măsurători în Sector 2. Verificăm cote, pereți, prize, apă/gaze (unde e cazul) și particularități ale spațiului, ca proiectarea 3D să fie cât mai precisă.',
      },
      {
        q: 'Se plătește avans? Cum funcționează plata?',
        a: 'Modelul de lucru este pe cerere de ofertă. Condițiile de plată (inclusiv avans, dacă se aplică) se stabilesc în etapa de ofertare, în funcție de proiect.',
      },
      {
        q: 'Ce garanție oferiți?',
        a: 'Oferim garanție conform legislației și condițiilor comunicate în ofertă. Durata și acoperirea depind de materialele și feroneria folosite, precum și de modul de utilizare.',
      },
      {
        q: 'Proiectarea 3D este inclusă?',
        a: 'Da, în etapa de ofertare lucrăm pe o propunere de proiectare 3D pentru a valida dimensiuni, compartimentări și finisaje înainte de execuție.',
      },
      {
        q: 'Montajul este inclus?',
        a: 'Montajul se discută și se bugetează în ofertă. Pentru Sector 2, în mod uzual putem include montajul și reglajele necesare la final.',
      },
    ],
    [],
  )

  const jsonLd = useMemo(() => {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'FurnitureStore',
        name: 'ADA ART MOB',
        url: canonicalUrl,
        areaServed: 'București – Sector 2',
        address: '[DE COMPLETAT: adresa]',
        telephone: '[DE COMPLETAT: telefon]',
        addressLocality: '[DE COMPLETAT: oras]',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Mobilă la comandă',
        serviceType: 'Mobilă la comandă',
        areaServed: 'București – Sector 2',
        provider: { '@type': 'FurnitureStore', name: 'ADA ART MOB' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((x) => ({
          '@type': 'Question',
          name: x.q,
          acceptedAnswer: { '@type': 'Answer', text: x.a },
        })),
      },
    ]
  }, [canonicalUrl, faq])

  return (
    <div className="bg-cream">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <div className="bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(74,93,78,0.10),transparent_55%),radial-gradient(900px_circle_at_95%_20%,rgba(198,139,89,0.10),transparent_55%),linear-gradient(to_bottom,#F6F2EE,#FFFFFF)]">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="text-sm text-text-muted">
            <Link className="hover:text-brand-mid" to="/">
              Acasă
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-dark">Mobilă la comandă Sector 2</span>
          </div>

          <h1 className="mt-5 max-w-3xl font-heading text-4xl font-semibold text-text-dark md:text-5xl">
            Mobilă la comandă în București – Sector 2
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted md:text-base">
            Dacă locuiești sau lucrezi în Sector 2 și cauți mobilă la comandă care să se potrivească perfect spațiului,
            te ajutăm să transformi ideile în soluții clare. Pornim de la dimensiuni reale, discutăm stilul, bugetul și
            modul de utilizare, apoi construim o propunere coerentă, fără compromisuri inutile.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted md:text-base">
            Lucrăm cu proiectare 3D ca să vezi din timp cum arată mobilierul, unde sunt poziționate compartimentările și
            ce finisaje se potrivesc. Apoi trecem la ofertă, execuție și montaj, cu o comunicare simplă și predictibilă.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted md:text-base">
            Pagina aceasta este dedicată căutării „mobilă la comandă București Sector 2” și explică serviciile, procesul
            și zonele în care ne deplasăm. Dacă ai deja o schiță sau inspirație, o poți încărca direct în configurator.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/configurator"
              className="inline-flex items-center justify-center rounded-full bg-brand-mid px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary"
            >
              Cere ofertă pentru Sector 2
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-text-dark transition hover:bg-cream"
            >
              Contact & WhatsApp
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14">
        <section className="grid gap-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl font-semibold text-text-dark">
              De ce ADA ART MOB pentru mobilă la comandă în Sector 2
            </h2>
            <div className="mt-4 grid gap-3 text-sm text-text-muted">
              <div>
                <span className="font-semibold text-text-dark">Proiectare:</span> pornim de la măsurători și planificăm
                compartimentările în funcție de utilizare (depozitare, ergonomie, flux). Proiectarea 3D ajută la
                decizii rapide și reduce riscul de surprize la montaj.
              </div>
              <div>
                <span className="font-semibold text-text-dark">Materiale:</span> lucrăm cu PAL/MDF și accesorii uzuale
                pentru mobilier la comandă, alegând combinația potrivită proiectului (cant, fronturi, blaturi) și
                explicând clar ce primești la fiecare opțiune.
              </div>
              <div>
                <span className="font-semibold text-text-dark">Execuție:</span> fiecare piesă este realizată după cote
                reale. Pentru proiecte complexe, împărțim lucrarea în etape astfel încât să păstrăm controlul asupra
                detaliilor.
              </div>
              <div>
                <span className="font-semibold text-text-dark">Montaj:</span> montajul și reglajele finale fac diferența
                între „arata bine” și „funcționează bine”. În ofertă clarificăm ce include montajul și condițiile de
                acces.
              </div>
              <div>
                <span className="font-semibold text-text-dark">Garanție:</span> oferim garanție conform legislației și
                condițiilor din ofertă, fără promisiuni exagerate. Îți spunem transparent ce acoperă și ce depinde de
                utilizare și întreținere.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl font-semibold text-text-dark">Servicii</h2>
            <div className="mt-4 grid gap-5 text-sm text-text-muted">
              <div>
                <h3 className="text-base font-semibold text-text-dark">Bucătării la comandă</h3>
                <p className="mt-1 leading-relaxed">
                  Proiectăm bucătării adaptate spațiilor din blocuri vechi sau noi din Sector 2: poziționare eficientă,
                  zone de lucru clare și soluții pentru colțuri, corpuri înalte sau electrocasnice încorporabile.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-dark">Dressinguri</h3>
                <p className="mt-1 leading-relaxed">
                  Dressinguri pe comandă pentru hol, dormitor sau nișe: compartimentări pentru umerașe, sertare, polițe,
                  pantofar și spații pentru valize. Alegem împreună uși glisante sau batante în funcție de acces.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-dark">Living / TV wall</h3>
                <p className="mt-1 leading-relaxed">
                  Mobilier pentru living și perete TV cu zone de depozitare, cabluri ascunse și proporții potrivite
                  camerei. Putem integra vitrine, rafturi sau panouri decorative, după stil.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-dark">Dormitor</h3>
                <p className="mt-1 leading-relaxed">
                  Mobilă de dormitor la comandă: dulapuri, comode, noptiere sau paturi cu depozitare. Optimizăm spațiul
                  și păstrăm un aspect aerisit, fără încărcare vizuală.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-dark">Baie</h3>
                <p className="mt-1 leading-relaxed">
                  Mobilă de baie cu mască pentru chiuvetă și dulapuri rezistente la utilizarea zilnică. Discutăm despre
                  ventilație, expunere la apă și accesul la instalații.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-dark">Birou</h3>
                <p className="mt-1 leading-relaxed">
                  Birouri și home office: blat la dimensiune, spații pentru cabluri, sertare și suporturi. Pentru spații
                  mici, propunem soluții pliabile sau modulare.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl font-semibold text-text-dark">Procesul de lucru</h2>
            <div className="mt-4 grid gap-3 text-sm text-text-muted">
              <div>
                <span className="font-semibold text-text-dark">1) Măsurători:</span> ne deplasăm în Sector 2, măsurăm
                corect și notăm detalii care influențează montajul (colțuri, denivelări, instalații, acces).
              </div>
              <div>
                <span className="font-semibold text-text-dark">2) Proiectare 3D:</span> construim propunerea cu
                compartimentări și finisaje, astfel încât să vezi exact cum arată înainte de execuție.
              </div>
              <div>
                <span className="font-semibold text-text-dark">3) Ofertare:</span> primești oferta în funcție de
                configurație, materiale și accesorii. Ajustăm până ajungem la o variantă potrivită.
              </div>
              <div>
                <span className="font-semibold text-text-dark">4) Execuție:</span> realizăm piesele la dimensiune, cu
                verificări intermediare pentru proiecte complexe.
              </div>
              <div>
                <span className="font-semibold text-text-dark">5) Montaj:</span> livrăm, montăm și facem reglajele finale.
                La final, îți prezentăm utilizarea corectă și recomandări de întreținere.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl font-semibold text-text-dark">Zone deservite în Sector 2</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Ne deplasăm în Sector 2 pentru măsurători și montaj, în funcție de proiect și programare. Exemple de zone și
              repere în care lucrăm frecvent: Colentina, Obor, Iancului, Tei, Ștefan cel Mare și zonele adiacente. Pentru
              proiecte punctuale, deplasarea se confirmă în funcție de adresă și disponibilitate.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl font-semibold text-text-dark">Materiale și feronerie</h2>
            <div className="mt-4 grid gap-3 text-sm text-text-muted">
              <div>
                <span className="font-semibold text-text-dark">PAL / MDF:</span> alegem în funcție de buget, rezistență și
                aspect (texturi, mat/lucios, fronturi). Îți explicăm diferențele și când merită fiecare opțiune.
              </div>
              <div>
                <span className="font-semibold text-text-dark">Cant:</span> cantul protejează muchiile și influențează
                durabilitatea. Stabilim împreună grosimea și tipul, în funcție de utilizare.
              </div>
              <div>
                <span className="font-semibold text-text-dark">Blaturi:</span> pentru bucătării și birouri, discutăm
                variante uzuale (grosimi, finisaje, rezistență). Alegerea se face în funcție de stil și întreținere.
              </div>
              <div>
                <span className="font-semibold text-text-dark">Feronerie:</span> balamale, glisiere și sisteme de deschidere
                se aleg în funcție de confort și frecvența utilizării, păstrând un echilibru corect între cost și fiabilitate.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl font-semibold text-text-dark">Portofoliu / lucrări</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Mai jos sunt câteva imagini de portofoliu (stiluri diferite) pentru inspirație. Pentru o ofertă exactă, trimite
              dimensiunile sau o schiță în configurator.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioItems.map((img) => (
                <div key={img.src} className="overflow-hidden rounded-2xl border border-border bg-cream">
                  <img src={img.src} alt={img.alt} loading="lazy" className="h-56 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft" id="faq">
            <h2 className="font-heading text-2xl font-semibold text-text-dark">Întrebări frecvente (FAQ)</h2>
            <div className="mt-4 grid gap-4">
              {faq.map((x) => (
                <div key={x.q} className="rounded-2xl border border-border bg-cream p-5">
                  <h3 className="text-base font-semibold text-text-dark">{x.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{x.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-brand-light p-6 shadow-soft">
            <h2 className="font-heading text-2xl font-semibold text-text-dark">Cere ofertă pentru Sector 2</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
              Spune-ne ce îți dorești și atașează poze sau schițe. Îți răspundem cu claritate și pași următori, pornind de la
              măsurători și proiectare 3D.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/configurator"
                className="inline-flex items-center justify-center rounded-full bg-brand-mid px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary"
              >
                Deschide configuratorul
              </Link>
              <a
                href="tel:+40712345678"
                className="inline-flex items-center justify-center rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-text-dark transition hover:bg-cream"
              >
                Telefon: +40 712 345 678
              </a>
              <a
                href="https://wa.me/40712345678"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-text-dark transition hover:bg-cream"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
