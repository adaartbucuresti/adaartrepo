import { motion } from 'framer-motion'
import { Leaf, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoWatermark from '../components/LogoWatermark.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function AboutPage() {
  const MotionDiv = motion.div
  return (
    <div className="bg-cream">
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <MotionDiv className="lg:col-span-6" variants={fadeUp} initial="hidden" animate="visible">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark">
                <span className="h-2 w-2 rounded-full bg-brand-mid" />
                Despre noi
              </div>

              <div className="mt-5">
                <div className="inline-flex items-center rounded-full bg-brand-light px-4 py-2 text-xs font-semibold text-brand-dark ring-1 ring-brand-primary/20">
                  <span className="font-heading text-base font-semibold text-brand-mid">25</span>
                  <span className="ml-2">de ani pe piață!</span>
                </div>
              </div>

              <h1 className="mt-5 max-w-xl font-heading text-4xl font-semibold text-text-dark md:text-6xl">
                Calitate artizanală, mobilă la comandă
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-muted md:text-base">
                Proiectăm și realizăm mobilier personalizat, adaptat fiecărui spațiu. De la primele
                schițe până la montaj, te ghidăm pas cu pas.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/configurator"
                  className="inline-flex items-center justify-center rounded-full bg-brand-primary px-7 py-3 text-sm font-medium text-white transition hover:bg-brand-mid"
                >
                  Începe în configurator
                </Link>
                <div className="text-xs font-semibold text-text-muted">
                  Lucrăm la comandă • materiale premium • finisaje curate
                </div>
              </div>
            </MotionDiv>

            <MotionDiv className="lg:col-span-6" variants={fadeUp} initial="hidden" animate="visible">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
                <div className="absolute bottom-5 right-5 z-10 rounded-2xl bg-brand-primary/90 px-4 py-3 text-xs font-semibold text-white shadow-soft backdrop-blur">
                  Calitate, de la schiță la montaj
                </div>
                <div className="relative aspect-[16/10]">
                  <img
                    src="/about-workshop.png"
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <LogoWatermark />
                  <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_0%_0%,rgba(198,139,89,0.30),rgba(198,139,89,0)_55%),linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0))]" />
                </div>
              </div>
            </MotionDiv>
          </div>
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
              <span className="font-semibold text-brand-mid">Suntem pe piață de 25 de ani</span>, iar fiecare proiect este construit cu aceeași prioritate:{' '}
              <span className="font-semibold text-brand-mid">calitatea</span> — de la alegerea materialelor până la montaj.
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
            <div className="relative aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?w=1200"
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <LogoWatermark />
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
              { k: '2 ani', v: 'garanție' },
              { k: '5–30 zile', v: 'livrare medie' },
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

