export const EXTRAS_OPTIONS = [
  { id: 'led_interior', label: 'Iluminat interior LED', price: 350 },
  { id: 'oglinda_usa', label: 'Oglindă pe ușă', price: 280 },
  { id: 'push_open', label: 'Sistem push-open fără mânere', price: 420 },
  { id: 'balamale_soft_close', label: 'Balamale soft-close (amortizare)', price: 250 },
  { id: 'glisiere_soft_close', label: 'Glisiere sertare soft-close', price: 320 },
  { id: 'sertare_interioare', label: 'Sertare interioare suplimentare', price: 450 },
  { id: 'polite_suplimentare', label: 'Polițe suplimentare', price: 180 },
  { id: 'bara_haine', label: 'Bara haine (crom / negru)', price: 160 },
  { id: 'organizator_pantofi', label: 'Organizator pantofi / suport pantofi', price: 300 },
  { id: 'inchidere_cheie', label: 'Închidere cu cheie (yală)', price: 220 },
  { id: 'decupaje_cabluri', label: 'Decupaje pentru priză / cabluri (cable management)', price: 120 },
  { id: 'reglaj_plinta', label: 'Reglaj / mască plintă (pentru denivelări)', price: 200 },
]

export function getExtraById(id) {
  return EXTRAS_OPTIONS.find((o) => o.id === id) || null
}

export function getExtrasTotal(selectedIds) {
  const ids = Array.isArray(selectedIds) ? selectedIds : []
  return ids.reduce((sum, id) => sum + (getExtraById(id)?.price || 0), 0)
}
