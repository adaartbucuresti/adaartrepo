export const MATERIAL_PRICING = [
  { 
    key: 'PAL melaminat', 
    description: 'Carcasă PAL', 
    pricePerMl: 2500,
    bgColor: '#FAF9F6',
    textureUrl: '/options/optiune1.jpg'
  },
  { 
    key: 'Carcasă PAL + Uși MDF AGT', 
    description: 'Carcasă PAL', 
    pricePerMl: 3000,
    bgColor: '#F4F4F5',
    textureUrl: '/options/optiune2.jpg'
  },
  { 
    key: 'Carcasă PAL + Uși MDF înfoliat', 
    description: 'Carcasă PAL', 
    pricePerMl: 3500,
    bgColor: '#F1F5F9',
    textureUrl: '/options/optiune3.jpg'
  },
  { 
    key: 'Carcasă PAL + Uși MDF vopsit', 
    description: 'Carcasă PAL', 
    pricePerMl: 4000,
    bgColor: '#FAFAFA',
    textureUrl: '/options/optiune4.jpg'
  },
]

export const DEFAULT_MATERIAL_KEY = MATERIAL_PRICING[0]?.key || 'PAL melaminat'

export const LEAD_GEN_CATEGORIES = [
  { key: 'Noptiere', label: 'Noptiere la comandă', startingPrice: 350 },
  { key: 'Paturi (fără saltea)', label: 'Paturi (fără saltea)', startingPrice: 1800 },
  { key: 'Panouri TV / Comode TV', label: 'Panouri TV / Comode TV', startingPrice: 900 },
  { key: 'Birouri', label: 'Birouri la comandă', startingPrice: 700 },
  { key: 'Mobilier Baie', label: 'Mobilier Baie la comandă', startingPrice: 800 },
  { key: 'Biblioteci / Corpuri living', label: 'Biblioteci / Corpuri living', startingPrice: 1500 },
]

export function isLeadGenCategory(categoryName) {
  if (!categoryName) return false
  const name = String(categoryName).trim().toLowerCase()
  // Verificăm atât cheia cât și label-ul, dar și dacă numele conține fragmente relevante
  return LEAD_GEN_CATEGORIES.some(c => {
    const key = c.key.toLowerCase()
    const label = c.label.toLowerCase()
    return name === key || name === label || 
           (key.includes('/') && key.split('/').some(part => name.includes(part.trim().toLowerCase())))
  })
}

export function getLeadGenData(categoryName) {
  if (!categoryName) return null
  const name = String(categoryName).trim().toLowerCase()
  return LEAD_GEN_CATEGORIES.find(c => {
    const key = c.key.toLowerCase()
    const label = c.label.toLowerCase()
    return name === key || name === label ||
           (key.includes('/') && key.split('/').some(part => name.includes(part.trim().toLowerCase())))
  }) || null
}

export function calcLinearMeters(widthCm) {
  const w = Number(widthCm) || 0
  return Math.max(0, w) / 100
}

export function calcEstimatedPriceRon(widthCm, pricePerMl) {
  const ml = calcLinearMeters(widthCm)
  return Math.round(ml * (Number(pricePerMl) || 0))
}

export function getMaterialPricing(key) {
  return MATERIAL_PRICING.find((m) => m.key === key) || MATERIAL_PRICING[0]
}

/*
Verificare rapidă:
- lățime 100 cm => 1.00 ml
- prețuri: 2500 / 3000 / 3500 / 4000 RON
*/
