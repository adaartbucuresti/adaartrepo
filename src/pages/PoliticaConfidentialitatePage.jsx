import { motion } from 'framer-motion'
import { ShieldCheck, Mail, Scale, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function PoliticaConfidentialitatePage() {
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
              <span className="text-text-dark">Politica de Confidențialitate</span>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-4 py-2 text-xs font-semibold text-text-dark shadow-soft backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-brand-mid" />
              GDPR & Confidențialitate
            </div>

            <h1 className="mt-4 font-heading text-4xl font-semibold text-text-dark md:text-5xl">
              Politica de Confidențialitate
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
              Această politică descrie modul în care ADA ART MOB SRL colectează și prelucrează datele cu caracter personal
              atunci când folosești site-ul și serviciile noastre.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <InfoCard icon={Users} title="Operator" value="ADA ART MOB SRL" />
              <InfoCard icon={Mail} title="Contact" value="mobdesign.ro@outlook.com" />
              <InfoCard icon={Scale} title="Autoritate" value="ANSPDCP" />
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
                <a className={tocLinkClass} href="#cine-suntem">Cine suntem</a>
                <a className={tocLinkClass} href="#date-colectate">Ce date colectăm</a>
                <a className={tocLinkClass} href="#unde-colectam">Unde colectăm datele</a>
                <a className={tocLinkClass} href="#scop">De ce le colectăm</a>
                <a className={tocLinkClass} href="#durata">Cât timp le păstrăm</a>
                <a className={tocLinkClass} href="#partajare">Cu cine le împărtășim</a>
                <a className={tocLinkClass} href="#drepturi">Drepturile utilizatorului</a>
                <a className={tocLinkClass} href="#dpo">Contact DPO</a>
                <a className={tocLinkClass} href="#anspdcp">Autoritate</a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="grid gap-6">
              <Section id="cine-suntem" title="Cine suntem">
                <p>Operator de date: ADA ART MOB SRL.</p>
              </Section>

              <Section id="date-colectate" title="Ce date colectăm">
                <ul className="grid gap-2">
                  <Bullet>nume real</Bullet>
                  <Bullet>email</Bullet>
                  <Bullet>parolă (stocată criptat / hash, nu în clar)</Bullet>
                  <Bullet>adresă</Bullet>
                  <Bullet>număr de telefon</Bullet>
                </ul>
              </Section>

              <Section id="unde-colectam" title="Unde colectăm datele">
                <ul className="grid gap-2">
                  <Bullet>formular register/login</Bullet>
                  <Bullet>configurator ofertă</Bullet>
                  <Bullet>formular contact</Bullet>
                  <Bullet>secțiunea „Profilul meu”</Bullet>
                </ul>
              </Section>

              <Section id="scop" title="De ce le colectăm">
                <ul className="grid gap-2">
                  <Bullet>gestionare cont</Bullet>
                  <Bullet>trimitere oferte</Bullet>
                  <Bullet>contact comercial</Bullet>
                </ul>
              </Section>

              <Section id="durata" title="Cât timp le păstrăm">
                <p>3 ani sau până la ștergerea contului.</p>
              </Section>

              <Section id="partajare" title="Cu cine le împărtășim">
                <p>Furnizor hosting (pentru funcționarea site-ului). Nu împărtășim datele cu alte părți.</p>
              </Section>

              <Section id="drepturi" title="Drepturile utilizatorului">
                <ul className="grid gap-2 md:grid-cols-2">
                  <Bullet>acces</Bullet>
                  <Bullet>rectificare</Bullet>
                  <Bullet>ștergere</Bullet>
                  <Bullet>opoziție</Bullet>
                  <Bullet>portabilitate</Bullet>
                </ul>
              </Section>

              <Section id="dpo" title="Contact DPO / responsabil date">
                <div className="rounded-2xl border border-brand-primary/15 bg-brand-light p-5">
                  <div className="text-xs font-semibold text-brand-dark">Email contact</div>
                  <div className="mt-2 text-sm font-semibold text-text-dark">mobdesign.ro@outlook.com</div>
                </div>
              </Section>

              <Section id="anspdcp" title="Autoritate de supraveghere">
                <p className="text-sm leading-relaxed text-text-muted">
                  ANSPDCP –{' '}
                  <a
                    className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark"
                    href="https://www.dataprotection.ro/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    www.dataprotection.ro
                  </a>
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
