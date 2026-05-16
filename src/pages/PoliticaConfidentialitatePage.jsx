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
                <a className={tocLinkClass} href="#introducere">Introducere</a>
                <a className={tocLinkClass} href="#operator">Operator & contact</a>
                <a className={tocLinkClass} href="#definitii">Definiții</a>
                <a className={tocLinkClass} href="#colectare">Colectare</a>
                <a className={tocLinkClass} href="#scopuri">Scopuri & temeiuri</a>
                <a className={tocLinkClass} href="#destinatari">Destinatari</a>
                <a className={tocLinkClass} href="#transferuri">Transferuri</a>
                <a className={tocLinkClass} href="#stocare">Stocare</a>
                <a className={tocLinkClass} href="#drepturi">Drepturi</a>
                <a className={tocLinkClass} href="#cookies">Cookies</a>
                <a className={tocLinkClass} href="#securitate">Securitate</a>
                <a className={tocLinkClass} href="#minori">Minori</a>
                <a className={tocLinkClass} href="#actualizari">Actualizări</a>
                <a className={tocLinkClass} href="#anspdcp">ANSPDCP</a>
                <a className={tocLinkClass} href="#pe-scurt">Pe scurt</a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="grid gap-6">
              <Section id="introducere" title="Politica de Confidențialitate (GDPR)">
                <p>
                  Ultima actualizare:{' '}
                  <span className="font-semibold text-text-dark">16.05.2026</span>
                </p>
                <p>
                  Această Politică de Confidențialitate descrie modul în care{' '}
                  <span className="font-semibold text-text-dark">ADA ART MOB SRL</span> (“noi”, “Operatorul”) prelucrează
                  datele cu caracter personal atunci când utilizezi website-ul{' '}
                  <span className="font-semibold text-text-dark">www.adaart.ro</span> (“Website-ul”) și serviciile asociate.
                </p>
                <p>
                  ADA ART MOB SRL pune accent pe protecția datelor dumneavoastră cu caracter personal și se obligă să le administreze
                  conform Regulamentului (UE) 2016/679 (GDPR), precum și în concordanță cu legislația românească aplicabilă. Prin acest
                  document vă informăm despre modalitățile de colectare, utilizare, păstrare și securizare a informațiilor dumneavoastră.
                </p>
                <p>Puncte de colectare: register/login, configurator ofertă, formular contact, secțiunea „Profilul meu”.</p>
              </Section>

              <Section id="operator" title="Operator de date & contact">
                <div className="grid gap-2">
                  <p>
                    <span className="font-semibold text-text-dark">Operator de date:</span> ADA ART MOB SRL
                  </p>
                  <p>
                    <span className="font-semibold text-text-dark">Sediu:</span> București, Sector 2, Str. Vasile Stolnicul, Nr. 3, România
                  </p>
                  <p>
                    <span className="font-semibold text-text-dark">CUI:</span> 34344807
                  </p>
                  <p>
                    <span className="font-semibold text-text-dark">Reg. Com.:</span> J2015004274403
                  </p>
                  <p>
                    <span className="font-semibold text-text-dark">Website:</span> www.adaart.ro
                  </p>
                  <p>
                    <span className="font-semibold text-text-dark">Contact protecția datelor:</span> mobdesign.ro@outlook.com
                  </p>
                </div>
              </Section>

              <Section id="definitii" title="Definiții (pe scurt)">
                <ul className="grid gap-2">
                  <Bullet>
                    <span className="font-semibold text-text-dark">Operator</span>: entitatea care stabilește scopurile și
                    mijloacele prelucrării datelor (aici: ADA ART MOB SRL).
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Persoană vizată</span>: persoana fizică ale cărei date sunt
                    prelucrate (vizitator, utilizator, client/potențial client).
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Prelucrare</span>: orice operațiune cu date (colectare,
                    stocare, utilizare, divulgare, ștergere etc.).
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Împuternicit</span>: furnizor care prelucrează date în
                    numele Operatorului, pe baza instrucțiunilor noastre și a unui contract.
                  </Bullet>
                </ul>
              </Section>

              <Section id="colectare" title="Ce date colectăm și de unde provin">
                <h3 className="mt-1 font-semibold text-text-dark">Categorii de date</h3>
                <ul className="grid gap-2">
                  <Bullet>nume real</Bullet>
                  <Bullet>email</Bullet>
                  <Bullet>parolă (stocată hash/criptată, nu în clar)</Bullet>
                  <Bullet>adresă</Bullet>
                  <Bullet>număr de telefon</Bullet>
                  <Bullet>IP și loguri tehnice (securitate/funcționare)</Bullet>
                </ul>

                <h3 className="mt-4 font-semibold text-text-dark">De unde provin</h3>
                <ul className="grid gap-2">
                  <Bullet>
                    <span className="font-semibold text-text-dark">Direct de la utilizator</span>: formulare, creare cont,
                    cereri din configurator, mesaje de contact, actualizare „Profilul meu”.
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Automat</span>: date tehnice generate prin folosirea
                    Website-ului (IP, loguri de acces/erori, evenimente de securitate) și, unde este cazul, cookies.
                  </Bullet>
                </ul>
              </Section>

              <Section id="scopuri" title="Scopuri și temeiuri legale (art. 6 GDPR)">
                <h3 className="mt-1 font-semibold text-text-dark">Cont / demersuri precontractuale</h3>
                <p>
                  <span className="font-semibold text-text-dark">Scop:</span> gestionarea contului, autentificare, administrarea
                  profilului, procesarea cererilor din configurator și comunicări legate de cerere/ofertă.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">Temei legal:</span> art. 6(1)(b) GDPR.
                </p>

                <h3 className="mt-4 font-semibold text-text-dark">Contact comercial</h3>
                <p>
                  <span className="font-semibold text-text-dark">Scop:</span> răspuns la solicitări, clarificări, comunicare
                  comercială punctuală.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">Temei legal:</span> art. 6(1)(f) GDPR (interes legitim).
                </p>
                <p>
                  <span className="font-semibold text-text-dark">Interes legitim:</span> menținerea unei comunicări eficiente cu
                  potențialii clienți și gestionarea cererilor în mod organizat și securizat.
                </p>

                <h3 className="mt-4 font-semibold text-text-dark">Marketing / newsletter</h3>
                <p>
                  <span className="font-semibold text-text-dark">Status:</span> în prezent nu trimitem newsletter și nu derulăm campanii de marketing prin e-mail pe baza unui abonament.
                </p>
                <p>
                  Dacă în viitor vom introduce newsletter/marketing, prelucrarea se va face doar pe baza consimțământului (art. 6(1)(a) GDPR), cu opțiune de retragere oricând.
                </p>

                <h3 className="mt-4 font-semibold text-text-dark">Securitate și prevenirea fraudelor</h3>
                <p>
                  <span className="font-semibold text-text-dark">Scop:</span> securizarea Website-ului, prevenirea accesului
                  neautorizat și a abuzurilor, investigarea incidentelor.
                </p>
                <p>
                  <span className="font-semibold text-text-dark">Temei legal:</span> art. 6(1)(f) GDPR (interes legitim).
                </p>

                <h3 className="mt-4 font-semibold text-text-dark">Obligații legale (dacă este cazul)</h3>
                <p>
                  <span className="font-semibold text-text-dark">Scop:</span> respectarea obligațiilor legale (ex.: contabilitate,
                  facturare, arhivare, solicitări ale autorităților).
                </p>
                <p>
                  <span className="font-semibold text-text-dark">Temei legal:</span> art. 6(1)(c) GDPR.
                </p>
                <p className="text-xs text-text-muted">
                  Notă: dacă emitem facturi/înregistrăm documente contabile pentru comenzi/contracte, păstrarea se face conform termenelor legale aplicabile.
                </p>
              </Section>

              <Section id="destinatari" title="Destinatari și împuterniciți">
                <h3 className="mt-1 font-semibold text-text-dark">Destinatari</h3>
                <ul className="grid gap-2">
                  <Bullet>
                    <span className="font-semibold text-text-dark">Furnizor hosting</span> – pentru găzduirea Website-ului și
                    funcționarea infrastructurii: Vercel (vercel.com) – Vercel, Inc., California, Statele Unite
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Servicii cont & stocare cereri ofertă</span> – pentru autentificare,
                    profil utilizator și stocarea cererilor din configurator: Supabase – Supabase, Inc., Singapore
                  </Bullet>
                </ul>

                <h3 className="mt-4 font-semibold text-text-dark">Posibili împuterniciți (în funcție de ce servicii utilizați)</h3>
                <p>
                  În prezent, nu folosim: analytics/măsurare trafic, servicii anti-spam/reCAPTCHA, procesator de plăți, curier, servicii
                  de contabilitate externalizate sau platforme de newsletter.
                </p>
                <p>
                  Dacă pe viitor vom introduce astfel de servicii, le vom enumera aici (cu furnizorii folosiți) și vom folosi contracte de
                  împuternicit (DPA), acolo unde este cazul.
                </p>
              </Section>

              <Section id="transferuri" title="Transferuri în afara UE/SEE">
                <p>
                  Unele servicii utilizate pot implica transferuri de date în afara UE/SEE (de exemplu către Statele Unite sau Singapore),
                  în funcție de infrastructura furnizorilor noștri (ex.: Vercel, Supabase).
                </p>
                <p>
                  În aceste situații, transferurile se vor realiza numai cu garanții adecvate, cum ar fi Clauze Contractuale Standard (SCC)
                  și/sau alte mecanisme permise de GDPR, împreună cu măsuri suplimentare de protecție, după caz. La cerere, îți putem oferi
                  detalii despre garanțiile aplicabile.
                </p>
              </Section>

              <Section id="stocare" title="Perioade de stocare">
                <p>Păstrăm datele doar cât este necesar pentru scopurile declarate sau pentru obligații legale / litigii.</p>
                <ul className="grid gap-2">
                  <Bullet>
                    <span className="font-semibold text-text-dark">Cont activ:</span> pe durata contului + <span className="font-semibold text-text-dark">[12 luni]</span> după ultima activitate (pentru suport, securitate, evidențe și potențiale litigii).
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Cereri ofertă (configurator) / contact:</span> <span className="font-semibold text-text-dark">[24 luni]</span> de la ultima interacțiune.
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Marketing/newsletter (dacă va exista):</span> până la retragerea consimțământului + <span className="font-semibold text-text-dark">[30 zile]</span> pentru propagare tehnică.
                  </Bullet>
                  <Bullet>
                    <span className="font-semibold text-text-dark">Loguri securitate:</span> <span className="font-semibold text-text-dark">[90 zile]</span> sau mai mult dacă este necesar pentru investigarea incidentelor.
                  </Bullet>
                </ul>
                <p className="text-xs text-text-muted">
                  Unele date pot fi păstrate mai mult pentru obligații legale sau apărarea drepturilor în instanță.
                </p>
              </Section>

              <Section id="drepturi" title="Drepturile persoanei vizate">
                <ul className="grid gap-2 md:grid-cols-2">
                  <Bullet>acces</Bullet>
                  <Bullet>rectificare</Bullet>
                  <Bullet>ștergere</Bullet>
                  <Bullet>restricționare</Bullet>
                  <Bullet>opoziție</Bullet>
                  <Bullet>portabilitate</Bullet>
                  <Bullet>retragere consimțământ</Bullet>
                  <Bullet>plângere la ANSPDCP</Bullet>
                </ul>
                <h3 className="mt-4 font-semibold text-text-dark">Cum se exercită</h3>
                <p>
                  Trimite o solicitare la <span className="font-semibold text-text-dark">mobdesign.ro@outlook.com</span>. Răspundem,
                  de regulă, în maximum <span className="font-semibold text-text-dark">30 de zile</span>.
                </p>
              </Section>

              <Section id="cookies" title="Cookies">
                <p>
                  Website-ul folosește cookie-uri tehnice esențiale (de exemplu pentru sesiune/autentificare), necesare funcționării.
                  În prezent, nu folosim Google Analytics sau Facebook Pixel.
                </p>
                <p>
                  Pentru detalii, vezi Politica de Cookies:{' '}
                  <Link className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark" to="/politica-cookies">
                    Politica Cookie-uri
                  </Link>
                </p>
                <p className="text-xs text-text-muted">
                  Notă: pentru gestionarea preferinței privind bannerul de cookies, putem salva o valoare în localStorage (ex.: „cookieConsent”).
                </p>
              </Section>

              <Section id="securitate" title="Securitatea datelor">
                <ul className="grid gap-2">
                  <Bullet>HTTPS/TLS pentru criptarea traficului</Bullet>
                  <Bullet>parole stocate hash/criptat (nu în clar)</Bullet>
                  <Bullet>control acces și măsuri organizaționale</Bullet>
                  <Bullet>loguri și monitorizare pentru securitate</Bullet>
                </ul>
              </Section>

              <Section id="minori" title="Minori">
                <p>
                  Serviciile nu sunt destinate minorilor sub <span className="font-semibold text-text-dark">16</span> ani. Dacă
                  aflăm că am colectat date de la un minor sub această vârstă, vom lua măsuri rezonabile pentru ștergerea lor.
                </p>
              </Section>

              <Section id="actualizari" title="Actualizări">
                <p>
                  Putem actualiza această politică pentru a reflecta schimbări legislative sau operaționale. Data ultimei actualizări
                  apare în partea de sus.
                </p>
                <p className="text-xs text-text-muted">
                  Pentru schimbări semnificative, putem notifica utilizatorii prin afișarea unui mesaj pe site și/sau prin e-mail (dacă există un cont
                  asociat și notificarea este relevantă).
                </p>
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

              <Section id="pe-scurt" title="Pe scurt">
                <ul className="grid gap-2">
                  <Bullet>Operator: ADA ART MOB SRL (Website: www.adaart.ro)</Bullet>
                  <Bullet>Contact protecția datelor: mobdesign.ro@outlook.com</Bullet>
                  <Bullet>Date: nume, email, parolă (hash/criptată), adresă, telefon, IP/loguri</Bullet>
                  <Bullet>Scopuri: cont/ofertare, contact comercial, marketing (cu consimțământ), securitate</Bullet>
                  <Bullet>Împuterniciți: hosting (Vercel) + cont/stocare (Supabase) + alții posibili dacă vor exista</Bullet>
                  <Bullet>Stocare: pe categorii, cu perioade editabile în [ ]</Bullet>
                  <Bullet>Drepturi GDPR: acces, ștergere, opoziție etc.; răspuns de regulă în 30 zile</Bullet>
                  <Bullet>Autoritate: ANSPDCP – https://www.dataprotection.ro/</Bullet>
                </ul>
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
