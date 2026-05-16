import { motion } from 'framer-motion'
import { FileText, ShieldCheck, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function TermeniConditiiPage() {
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
              <span className="text-text-dark">Termeni și Condiții</span>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-4 py-2 text-xs font-semibold text-text-dark shadow-soft backdrop-blur">
              <FileText className="h-4 w-4 text-brand-mid" />
              Document legal
            </div>

            <h1 className="mt-4 font-heading text-4xl font-semibold text-text-dark md:text-5xl">
              Termeni și Condiții
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
              Prin accesarea și utilizarea acestui site, accepți termenii și condițiile de mai jos.
              <span className="ml-2">
                Ultima actualizare: <span className="font-semibold text-text-dark">16.05.2026</span>
              </span>
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <InfoCard icon={ShieldCheck} title="Utilizare" value="Reguli cont & site" />
              <InfoCard icon={FileText} title="Conținut" value="Drepturi de autor" />
              <InfoCard icon={Scale} title="Lege" value="Legislația română" />
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
                <a className={tocLinkClass} href="#operator">Operator</a>
                <a className={tocLinkClass} href="#servicii">Descrierea serviciilor</a>
                <a className={tocLinkClass} href="#cereri">Cereri de ofertă</a>
                <a className={tocLinkClass} href="#oferta">Oferta & acceptare</a>
                <a className={tocLinkClass} href="#livrare">Livrare & montaj</a>
                <a className={tocLinkClass} href="#executie">Termen execuție</a>
                <a className={tocLinkClass} href="#garantie">Garanție</a>
                <a className={tocLinkClass} href="#cont">Cont</a>
                <a className={tocLinkClass} href="#ip">Proprietate intelectuală</a>
                <a className={tocLinkClass} href="#limitare">Limitarea răspunderii</a>
                <a className={tocLinkClass} href="#modificari">Modificări</a>
                <a className={tocLinkClass} href="#lege">Legea aplicabilă</a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="grid gap-6">
              <Section id="operator" title="Operator">
                <div className="grid gap-2">
                  <p>
                    <span className="font-semibold text-text-dark">ADA ART MOB SRL</span> (CUI 34344807, Reg. Com. J2015004274403)
                  </p>
                  <p>București, Sector 2, Str. Vasile Stolnicul, Nr. 3, România</p>
                  <p>
                    <span className="font-semibold text-text-dark">Website:</span> www.adaart.ro
                  </p>
                  <p>
                    <span className="font-semibold text-text-dark">Contact:</span> mobdesign.ro@outlook.com
                  </p>
                </div>
              </Section>

              <Section id="servicii" title="Descrierea serviciilor">
                <p>
                  ADA ART MOB SRL oferă servicii de proiectare și realizare de mobilier la comandă, precum și posibilitatea
                  de a trimite cereri de ofertă prin configurator și formulare online.
                </p>
                <p>
                  Website-ul este un site de <span className="font-semibold text-text-dark">cerere ofertă</span>. Nu există comenzi
                  și nu se efectuează plăți online.
                </p>
              </Section>

              <Section id="cereri" title="Cereri de ofertă">
                <ul className="grid gap-2">
                  <Bullet>
                    Trimiterea unei cereri prin configurator/formulare nu reprezintă o comandă și nu creează automat o obligație de
                    livrare sau de plată.
                  </Bullet>
                  <Bullet>
                    Cererile pot fi preluate și procesate de echipa noastră, inclusiv prin canale interne de comunicare (de exemplu,
                    mesagerie) pentru a asigura răspuns rapid.
                  </Bullet>
                  <Bullet>
                    Te obligi să furnizezi informații corecte și actualizate, necesare pentru estimarea și comunicarea ofertei.
                  </Bullet>
                </ul>
              </Section>

              <Section id="oferta" title="Oferta & acceptare">
                <p>
                  Oferta se comunică în urma analizării cererii. Acceptarea ofertei se face telefonic și prin intermediul sistemului
                  „Contul meu”, unde primești răspunsul final.
                </p>
                <p>
                  Recomandăm stabilirea unei valabilități pentru ofertă (pentru a evita schimbările de preț ale materialelor și
                  disponibilitatea furnizorilor). În mod uzual, oferta este valabilă <span className="font-semibold text-text-dark">14 zile</span> de la comunicare.
                </p>
                <p>
                  Nu solicităm avans prin Website. Orice condiții de plată (dacă vor exista) vor fi comunicate separat, în etapa de
                  ofertare/acceptare.
                </p>
              </Section>

              <Section id="livrare" title="Livrare & montaj">
                <p>Livrăm și montăm în București și împrejurimi.</p>
                <ul className="grid gap-2">
                  <Bullet>Programarea livrării/montajului se stabilește de comun acord.</Bullet>
                  <Bullet>Clientul trebuie să asigure accesul adecvat pentru livrare și montaj (după caz, loc de parcare, acces în imobil).</Bullet>
                  <Bullet>În cazul în care livrarea/montajul nu poate fi efectuat(ă) din motive neimputabile nouă, putem reprograma.</Bullet>
                </ul>
              </Section>

              <Section id="executie" title="Termen execuție">
                <p>
                  Termenul de execuție depinde de complexitatea lucrării și se situează, de regulă, între{' '}
                  <span className="font-semibold text-text-dark">5 și 30 zile</span>, calculat din momentul acceptării ofertei și al
                  confirmării tuturor detaliilor necesare.
                </p>
                <p className="text-xs text-text-muted">
                  Termenele sunt orientative și pot varia în funcție de disponibilitatea materialelor și de volumul de comenzi.
                </p>
              </Section>

              <Section id="garantie" title="Garanție">
                <p>
                  Oferim garanție <span className="font-semibold text-text-dark">24 luni</span>, în condițiile legislației aplicabile și
                  ale instrucțiunilor de utilizare.
                </p>
                <ul className="grid gap-2">
                  <Bullet>Garanția nu acoperă uzura normală, utilizarea necorespunzătoare, intervenții neautorizate sau deteriorări accidentale.</Bullet>
                  <Bullet>Reclamațiile se transmit la mobdesign.ro@outlook.com, cu o descriere și fotografii, dacă este posibil.</Bullet>
                </ul>
              </Section>

              <Section id="cont" title="Condiții de utilizare a contului">
                <ul className="grid gap-2">
                  <Bullet>Contul este personal; nu îl partaja cu alte persoane.</Bullet>
                  <Bullet>Te obligi să furnizezi informații corecte și actualizate.</Bullet>
                  <Bullet>Ești responsabil de păstrarea confidențialității datelor de autentificare.</Bullet>
                </ul>
              </Section>

              <Section id="ip" title="Proprietate intelectuală">
                <p>
                  Conținutul site-ului (texte, imagini, elemente grafice, design) aparține ADA ART MOB SRL sau partenerilor
                  săi și este protejat de legislația privind drepturile de autor. Orice utilizare neautorizată este interzisă.
                </p>
              </Section>

              <Section id="limitare" title="Limitarea răspunderii">
                <p>
                  Depunem eforturi pentru ca informațiile afișate să fie corecte și actualizate, însă pot exista erori.
                  ADA ART MOB SRL nu răspunde pentru eventuale prejudicii rezultate din utilizarea site-ului, în limita
                  permisă de lege.
                </p>
                <p>
                  Website-ul oferă informații și funcționalități de cerere ofertă. Nu garantăm disponibilitatea neîntreruptă a
                  serviciilor online și ne rezervăm dreptul de a interveni pentru mentenanță sau securitate.
                </p>
              </Section>

              <Section id="modificari" title="Modificări ale termenilor">
                <p>
                  Putem actualiza acești Termeni și Condiții pentru a reflecta schimbări ale serviciilor, cerințe legale sau
                  îmbunătățiri. Data ultimei actualizări este afișată în partea de sus a paginii.
                </p>
              </Section>

              <Section id="lege" title="Legea aplicabilă">
                <div className="rounded-2xl border border-brand-primary/15 bg-brand-light p-5">
                  <div className="text-xs font-semibold text-brand-dark">Jurisdicție</div>
                  <div className="mt-2 text-sm font-semibold text-text-dark">Legislația română</div>
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
