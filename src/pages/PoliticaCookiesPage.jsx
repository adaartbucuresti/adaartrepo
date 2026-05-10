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
              Cookies tehnice
            </div>

            <h1 className="mt-4 font-heading text-4xl font-semibold text-text-dark md:text-5xl">
              Politica Cookie-uri
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
              Această pagină explică ce sunt cookie-urile și cum sunt folosite pe site.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <InfoCard icon={ShieldCheck} title="Tip" value="Tehnice & necesare" />
              <InfoCard icon={Info} title="Control" value="Setări browser" />
              <InfoCard icon={Cookie} title="Tracking" value="Fără analytics/pixel" />
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
                <a className={tocLinkClass} href="#ce-sunt">Ce sunt cookie-urile</a>
                <a className={tocLinkClass} href="#ce-folosim">Ce cookie-uri folosim</a>
                <a className={tocLinkClass} href="#dezactivare">Cum pot fi dezactivate</a>
                <a className={tocLinkClass} href="#analytics">Google Analytics / Pixel</a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="grid gap-6">
              <Section id="ce-sunt" title="Ce sunt cookie-urile">
                <p>
                  Cookie-urile sunt fișiere mici stocate în browserul tău, care ajută la funcționarea corectă a site-ului și
                  la îmbunătățirea experienței.
                </p>
              </Section>

              <Section id="ce-folosim" title="Ce cookie-uri folosim">
                <p>Folosim cookie-uri tehnice necesare funcționării site-ului, precum:</p>
                <ul className="grid gap-2">
                  <Bullet>cookie-uri de sesiune</Bullet>
                  <Bullet>cookie-uri de autentificare</Bullet>
                </ul>
              </Section>

              <Section id="dezactivare" title="Cum pot fi dezactivate din browser">
                <p>
                  Poți bloca sau șterge cookie-urile din setările browserului. Reține că dezactivarea cookie-urilor tehnice
                  poate afecta funcționarea site-ului (de exemplu autentificarea).
                </p>
              </Section>

              <Section id="analytics" title="Google Analytics / Pixel">
                <div className="rounded-2xl border border-brand-primary/15 bg-brand-light p-5">
                  <div className="text-xs font-semibold text-brand-dark">Status tracking</div>
                  <div className="mt-2 text-sm font-semibold text-text-dark">
                    În prezent, site-ul nu folosește Google Analytics sau Facebook Pixel.
                  </div>
                </div>
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
