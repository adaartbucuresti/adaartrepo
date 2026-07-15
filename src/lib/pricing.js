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
