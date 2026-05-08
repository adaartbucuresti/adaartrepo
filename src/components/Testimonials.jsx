import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const items = [
  {
    quote:
      'Am configurat dulapul exact pe dimensiunile nișei. A ieșit impecabil și montajul a fost rapid.',
    name: 'Andreea P.',
    city: 'Cluj-Napoca',
  },
  {
    quote:
      'Materialele se simt premium, iar comunicarea a fost foarte clară. Recomand pentru proiecte la comandă.',
    name: 'Mihai T.',
    city: 'București',
  },
  {
    quote:
      'Biblioteca modulară a fost soluția perfectă. Am primit propuneri utile și rezultate peste așteptări.',
    name: 'Ioana S.',
    city: 'Timișoara',
  },
]

export default function Testimonials() {
  const MotionDiv = motion.div
  const [rows, setRows] = useState(items)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    supabase
      .from('testimonials')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (!alive) return
        const mapped = (data || []).map((t) => ({
          quote: t.text,
          name: t.client_name,
          city: t.client_city || '',
        }))
        if (mapped.length) setRows(mapped)
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <MotionDiv
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="font-heading text-3xl font-semibold text-text-dark">
            Ce spun clienții
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Păreri reale de la proiecte realizate la comandă.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {loading && rows.length === 0 ? (
            <div className="md:col-span-3 rounded-2xl border border-border bg-white p-6 text-center text-sm text-text-muted shadow-soft">
              Se încarcă…
            </div>
          ) : null}
          {rows.map((t) => (
            <MotionDiv
              key={t.name}
              className="rounded-2xl border border-border bg-white p-6 shadow-soft"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              <div className="text-sm leading-relaxed text-text-dark">“{t.quote}”</div>
              <div className="mt-5 text-sm font-semibold text-brand-dark">{t.name}</div>
              <div className="mt-0.5 text-xs text-text-muted">{t.city}</div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  )
}

