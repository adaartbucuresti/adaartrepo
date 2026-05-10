import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function PoliticaCookiesPage() {
  const MotionDiv = motion.div

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="font-heading text-4xl font-semibold text-text-dark md:text-5xl">
            Politica Cookie-uri
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-text-muted">
            Această pagină explică ce sunt cookie-urile și cum sunt folosite pe site.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-6">
          <Section title="Ce sunt cookie-urile">
            <p>
              Cookie-urile sunt fișiere mici stocate în browserul tău, care ajută la funcționarea corectă a site-ului și
              la îmbunătățirea experienței.
            </p>
          </Section>

          <Section title="Ce cookie-uri folosim">
            <p>Folosim cookie-uri tehnice necesare funcționării site-ului, precum:</p>
            <ul className="list-disc pl-5">
              <li>cookie-uri de sesiune</li>
              <li>cookie-uri de autentificare</li>
            </ul>
          </Section>

          <Section title="Cum pot fi dezactivate din browser">
            <p>
              Poți bloca sau șterge cookie-urile din setările browserului. Reține că dezactivarea cookie-urilor tehnice
              poate afecta funcționarea site-ului (de exemplu autentificarea).
            </p>
          </Section>

          <Section title="Google Analytics / Pixel">
            <p>În prezent, site-ul nu folosește Google Analytics sau Facebook Pixel.</p>
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

