import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function PoliticaConfidentialitatePage() {
  const MotionDiv = motion.div

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="font-heading text-4xl font-semibold text-text-dark md:text-5xl">
            Politica de Confidențialitate
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-text-muted">
            Această politică descrie modul în care ADA ART MOB SRL colectează și prelucrează datele cu caracter personal
            atunci când folosești site-ul și serviciile noastre.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-6">
          <Section title="Cine suntem">
            <p>Operator de date: ADA ART MOB SRL.</p>
          </Section>

          <Section title="Ce date colectăm">
            <ul className="list-disc pl-5">
              <li>nume real</li>
              <li>email</li>
              <li>parolă (stocată criptat / hash, nu în clar)</li>
              <li>adresă</li>
              <li>număr de telefon</li>
            </ul>
          </Section>

          <Section title="Unde colectăm datele">
            <ul className="list-disc pl-5">
              <li>formular register/login</li>
              <li>configurator ofertă</li>
              <li>formular contact</li>
              <li>secțiunea „Profilul meu”</li>
            </ul>
          </Section>

          <Section title="De ce le colectăm">
            <ul className="list-disc pl-5">
              <li>gestionare cont</li>
              <li>trimitere oferte</li>
              <li>contact comercial</li>
            </ul>
          </Section>

          <Section title="Cât timp le păstrăm">
            <p>3 ani sau până la ștergerea contului.</p>
          </Section>

          <Section title="Cu cine le împărtășim">
            <p>Furnizor hosting (pentru funcționarea site-ului). Nu împărtășim datele cu alte părți.</p>
          </Section>

          <Section title="Drepturile utilizatorului">
            <ul className="list-disc pl-5">
              <li>acces</li>
              <li>rectificare</li>
              <li>ștergere</li>
              <li>opoziție</li>
              <li>portabilitate</li>
            </ul>
          </Section>

          <Section title="Contact DPO / responsabil date">
            <p>mobdesign.ro@outlook.com</p>
          </Section>

          <Section title="Autoritate de supraveghere">
            <p>
              ANSPDCP –{' '}
              <a className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark" href="https://www.dataprotection.ro/" target="_blank" rel="noreferrer">
                www.dataprotection.ro
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
      <h2 className="font-heading text-xl font-semibold text-text-dark">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-text-muted">{children}</div>
    </section>
  )
}

