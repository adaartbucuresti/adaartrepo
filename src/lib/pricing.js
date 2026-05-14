export const MATERIAL_PRICING = [
  { key: 'PAL melaminat', description: 'Carcasă PAL', pricePerMl: 2500 },
  { key: 'Carcasă PAL + Uși MDF AGT', description: 'Carcasă PAL', pricePerMl: 3000 },
  { key: 'Carcasă PAL + Uși MDF înfoliat', description: 'Carcasă PAL', pricePerMl: 3500 },
  { key: 'Carcasă PAL + Uși MDF vopsit', description: 'Carcasă PAL', pricePerMl: 4000 },
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
