import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const steps = [
  {
    n: '01',
    title: 'Alegi tipul de mobilă',
    desc: 'Selectezi categoria potrivită pentru spațiul tău.',
  },
  {
    n: '02',
    title: 'Configurezi detaliile',
    desc: 'Dimensiuni, material, culoare și opțiuni extra.',
  },
  {
    n: '03',
    title: 'Trimiți cererea',
    desc: 'Te contactăm în 24h cu oferta personalizată.',
  },
]

export default function HowItWorks() {
  const MotionDiv = motion.div
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <MotionDiv
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="font-heading text-3xl font-semibold text-text-dark">
            Cum funcționează
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Fără coș de cumpărături. Totul pornește din configurator.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <MotionDiv
              key={s.n}
              className="rounded-2xl border border-border bg-cream p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brand-primary/30 hover:bg-white hover:shadow-softLg"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              <div className="text-4xl font-semibold text-brand-primary">{s.n}</div>
              <div className="mt-3 text-lg font-semibold text-text-dark">{s.title}</div>
              <div className="mt-2 text-sm text-text-muted">{s.desc}</div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  )
}

