import { motion } from 'framer-motion'
import { Leaf, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function AboutPage() {
  const MotionDiv = motion.div
  return (
    <div className="bg-cream">
      <section className="relative overflow-hidden bg-cream">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600"
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
            <div className="text-sm font-medium text-white/80">Despre noi</div>
            <h1 className="mt-3 max-w-2xl font-heading text-4xl font-semibold text-white md:text-6xl">
              Calitate artizanală, mobilă la comandă
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
              Proiectăm și realizăm mobilier personalizat, adaptat fiecărui spațiu. De la primele
              schițe până la montaj, te ghidăm pas cu pas.
            </p>
            <Link
              to="/configurator"
              className="mt-8 inline-flex rounded-full bg-brand-primary px-7 py-3 text-sm font-medium text-white transition hover:bg-brand-mid"
            >
              Începe în configurator
            </Link>
          </MotionDiv>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
          <MotionDiv
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <h2 className="font-heading text-3xl font-semibold text-text-dark">Povestea noastră</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Mob Design s-a născut din pasiunea pentru materiale naturale și design funcțional. Ne
              concentrăm pe detalii, finisaje curate și soluții inteligente pentru locuințe moderne.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Lucrăm transparent: configurezi online, apoi discutăm și validăm măsurătorile, iar
              echipa noastră îți propune varianta optimă.
            </p>
          </MotionDiv>

          <MotionDiv
            className="overflow-hidden rounded-2xl border border-border bg-cream shadow-soft"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?w=1200"
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <MotionDiv
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <h2 className="font-heading text-3xl font-semibold text-text-dark">Valorile noastre</h2>
            <p className="mt-2 text-sm text-text-muted">Ce primești la fiecare proiect.</p>
          </MotionDiv>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Calitate',
                desc: 'Materiale premium și execuție atentă, cu garanție extinsă.',
              },
              {
                icon: SlidersHorizontal,
                title: 'Personalizare',
                desc: 'Dimensiuni și finisaje adaptate exact spațiului tău.',
              },
              {
                icon: Leaf,
                title: 'Sustenabilitate',
                desc: 'Optimizăm consumul de material și alegem soluții durabile.',
              },
            ].map((v) => {
              const Icon = v.icon
              return (
                <MotionDiv
                  key={v.title}
                  className="rounded-2xl border border-border bg-white p-6 shadow-soft"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-text-dark">{v.title}</div>
                  <div className="mt-2 text-sm text-text-muted">{v.desc}</div>
                </MotionDiv>
              )
            })}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { k: '500+', v: 'proiecte finalizate' },
              { k: '5 ani', v: 'garanție' },
              { k: '30 zile', v: 'livrare medie' },
            ].map((s) => (
              <MotionDiv
                key={s.k}
                className="rounded-2xl border border-border bg-brand-light p-6"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="text-4xl font-semibold text-brand-dark">{s.k}</div>
                <div className="mt-2 text-sm font-medium text-text-dark">{s.v}</div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

