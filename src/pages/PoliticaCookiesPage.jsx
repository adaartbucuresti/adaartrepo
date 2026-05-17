import { motion } from 'framer-motion'
import { Cookie, Info, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function PoliticaCookiesPage() {
  const MotionDiv = motion.div

  return (
    <div className="bg-cream">
      <div className="bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(74,93,78,0.14),transparent_55%),radial-gradient(900px_circle_at_95%_20%,rgba(198,139,89,0.16),transparent_55%),linear-gradient(to_bottom,#F6F2EE,#FFFFFF)]">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <Link className="hover:text-brand-mid" to="/">
                Acasă
              </Link>
              <span>/</span>
              <span className="text-text-dark">Politica Cookie-uri</span>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-4 py-2 text-xs font-semibold text-text-dark shadow-soft backdrop-blur">
              <Cookie className="h-4 w-4 text-brand-mid" />
              Cookies & stocare locală
            </div>

            <h1 className="mt-4 font-heading text-4xl font-semibold text-text-dark md:text-5xl">
              Politica Cookie-uri
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
              Această pagină explică ce sunt cookie-urile și tehnologiile similare (ex. localStorage) și cum sunt folosite pe
              website-ul nostru.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <InfoCard icon={ShieldCheck} title="Tip" value="Tehnice & necesare" />
              <InfoCard icon={Info} title="Control" value="Browser + date site" />
              <InfoCard icon={Cookie} title="Tracking" value="Fără analytics/pixel (acum)" />
            </div>
          </MotionDiv>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-32 rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="text-sm font-semibold text-text-dark">Cuprins</div>
              <div className="mt-4 grid gap-2 text-sm">
                <a className={tocLinkClass} href="#introducere">Introducere</a>
                <a className={tocLinkClass} href="#tehnologii">Cookie-uri și tehnologii similare</a>
                <a className={tocLinkClass} href="#necesare">Ce folosim pe site (necesar)</a>
                <a className={tocLinkClass} href="#terti">Servicii terțe (Google Maps)</a>
                <a className={tocLinkClass} href="#control">Cum poți controla / șterge</a>
                <a className={tocLinkClass} href="#analytics">Analytics / Pixel</a>
                <a className={tocLinkClass} href="#contact">Contact</a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="grid gap-6">
              <Section id="introducere" title="Introducere">
                <p>
                  Operatorul website-ului este <span className="font-semibold text-text-dark">ADA ART MOB SRL</span>. Pentru
                  întrebări legate de confidențialitate și cookies ne poți contacta la{' '}
                  <a
                    className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark"
                    href="mailto:mobdesign.ro@outlook.com"
                  >
                    mobdesign.ro@outlook.com
                  </a>
                  .
                </p>
                <p>
                  Pentru detalii despre prelucrarea datelor personale (GDPR), consultă{' '}
                  <Link
                    to="/politica-confidentialitate"
                    className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark"
                  >
                    Politica de Confidențialitate
                  </Link>
                  .
                </p>
              </Section>

              <Section id="tehnologii" title="Cookie-uri și tehnologii similare">
                <p>
                  Cookie-urile sunt fișiere mici stocate în browserul tău. În plus, unele aplicații web folosesc și tehnologii
                  similare, precum <span className="font-semibold text-text-dark">localStorage</span> sau{' '}
                  <span className="font-semibold text-text-dark">sessionStorage</span>, pentru a salva local anumite setări
                  sau informații de sesiune.
                </p>
              </Section>

              <Section id="necesare" title="Ce folosim pe site (necesar)">
                <p>
                  Website-ul este conceput să funcționeze fără cookies de marketing sau analytics. Folosim strict ceea ce este
                  necesar pentru funcționare și securitate.
                </p>
                <ul className="grid gap-2">
                  <Bullet>
                    <span className="font-semibold text-text-dark">Autentificare și sesiune cont</span> (stocare locală) – pentru
                    menținerea sesiunii după login și pentru funcții precum „Contul meu”.
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Preferințe minime</span> – salvăm local acceptarea bannerului de
                    informare cookies (ex.: o valoare de tip <span className="font-semibold text-text-dark">cookieConsent</span>).
                  </Bullet>
                </ul>
                <p className="text-xs text-text-muted">
                  Notă: când spunem „stocare locală”, ne referim în principal la localStorage/sessionStorage din browser.
                </p>
              </Section>

              <Section id="terti" title="Servicii terțe (Google Maps)">
                <p>
                  În pagina de Contact afișăm o hartă încorporată prin{' '}
                  <span className="font-semibold text-text-dark">Google Maps</span> (iframe). Atunci când harta este încărcată,
                  <span className="font-semibold text-text-dark"> Google</span> poate seta propriile cookies/identificatori și poate
                  colecta date conform politicilor sale.
                </p>
                <p className="text-xs text-text-muted">
                  Poți consulta politicile Google aici: https://policies.google.com/technologies/cookies
                </p>
              </Section>

              <Section id="control" title="Cum poți controla / șterge">
                <p>Poți controla cookies și datele salvate local astfel:</p>
                <ul className="grid gap-2">
                  <Bullet>
                    <span className="font-semibold text-text-dark">Din browser</span>: poți bloca sau șterge cookie-urile din setările
                    browserului. Reține că dezactivarea cookie-urilor tehnice poate afecta funcționarea site-ului (ex. autentificarea).
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Ștergere date site</span>: poți șterge „Site data” / „Date site”
                    (cookies + localStorage) pentru website-ul nostru din setările browserului.
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Google Maps</span>: dacă nu dorești cookies terțe, poți bloca cookies
                    de la terți în browser; acest lucru poate afecta afișarea hărții.
                  </Bullet>
                </ul>
              </Section>

              <Section id="analytics" title="Analytics / Pixel">
                <div className="rounded-2xl border border-brand-primary/15 bg-brand-light p-5">
                  <div className="text-xs font-semibold text-brand-dark">Status tracking</div>
                  <div className="mt-2 text-sm font-semibold text-text-dark">
                    În prezent, site-ul nu folosește Google Analytics sau Facebook Pixel.
                  </div>
                  <div className="mt-2 text-xs text-text-muted">
                    Dacă pe viitor vom introduce astfel de servicii, vom actualiza această pagină și vom implementa un mecanism de consimțământ
                    pentru cookies neesențiale.
                  </div>
                </div>
              </Section>

              <Section id="contact" title="Contact">
                <p>
                  Pentru întrebări legate de cookies și confidențialitate, ne poți contacta la{' '}
                  <a
                    className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark"
                    href="mailto:mobdesign.ro@outlook.com"
                  >
                    mobdesign.ro@outlook.com
                  </a>
                  .
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const tocLinkClass =
  'rounded-xl px-3 py-2 text-text-muted transition hover:bg-brand-light hover:text-text-dark'

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-primary/15">
          <Icon className="h-5 w-5 text-brand-dark" />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-text-muted">{title}</div>
          <div className="mt-0.5 truncate text-sm font-semibold text-text-dark">{value}</div>
        </div>
      </div>
    </div>
  )
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-32 rounded-2xl border border-border bg-white p-6 shadow-soft">
      <h2 className="font-heading text-xl font-semibold text-text-dark">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-muted">{children}</div>
    </section>
  )
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-mid" />
      <span className="min-w-0">{children}</span>
    </li>
  )
}
