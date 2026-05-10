import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function TermeniConditiiPage() {
  const MotionDiv = motion.div

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="font-heading text-4xl font-semibold text-text-dark md:text-5xl">
            Termeni și Condiții
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-text-muted">
            Prin accesarea și utilizarea acestui site, accepți termenii și condițiile de mai jos.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-6">
          <Section title="Descrierea serviciilor">
            <p>
              ADA ART MOB SRL oferă servicii de proiectare și realizare de mobilier la comandă, precum și posibilitatea
              de a trimite cereri de ofertă prin configurator și formulare online.
            </p>
          </Section>

          <Section title="Condiții de utilizare a contului">
            <ul className="list-disc pl-5">
              <li>Contul este personal; nu îl partaja cu alte persoane.</li>
              <li>Te obligi să furnizezi informații corecte și actualizate.</li>
              <li>Ești responsabil de păstrarea confidențialității datelor de autentificare.</li>
            </ul>
          </Section>

          <Section title="Proprietate intelectuală">
            <p>
              Conținutul site-ului (texte, imagini, elemente grafice, design) aparține ADA ART MOB SRL sau partenerilor
              săi și este protejat de legislația privind drepturile de autor. Orice utilizare neautorizată este interzisă.
            </p>
          </Section>

          <Section title="Limitarea răspunderii">
            <p>
              Depunem eforturi pentru ca informațiile afișate să fie corecte și actualizate, însă pot exista erori.
              ADA ART MOB SRL nu răspunde pentru eventuale prejudicii rezultate din utilizarea site-ului, în limita
              permisă de lege.
            </p>
          </Section>

          <Section title="Legea aplicabilă">
            <p>Prezentul document este guvernat de legislația română.</p>
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

