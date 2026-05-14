export const OTHER_COLOR_ID = 'other_color'
export const OTHER_COLOR_LABEL = 'Altă culoare (la cerere)'

const withOther = (items) => [...items, { id: OTHER_COLOR_ID, label: OTHER_COLOR_LABEL, hex: '#e7e7e2' }]

export const COLORS_BY_MATERIAL = {
  'PAL melaminat': withOther([
    { id: 'pal_alb_mat', label: 'Alb mat', hex: '#f3f3f1' },
    { id: 'pal_alb_lucios', label: 'Alb lucios', hex: '#ffffff' },
    { id: 'pal_negru_mat', label: 'Negru mat', hex: '#1f2124' },
    { id: 'pal_gri_deschis', label: 'Gri deschis', hex: '#d9d7d4' },
    { id: 'pal_gri_antracit', label: 'Gri antracit', hex: '#303235' },
    { id: 'pal_stejar_natur', label: 'Stejar natur', hex: '#b9935a' },
    { id: 'pal_nuc', label: 'Nuc', hex: '#6a4b36' },
    { id: 'pal_beton', label: 'Beton', hex: '#a9a39b' },
  ]),
  'Carcasă PAL + Uși MDF AGT': withOther([
    { id: 'agt_alb_lucios', label: 'Alb lucios', hex: '#ffffff' },
    { id: 'agt_alb_mat', label: 'Alb mat', hex: '#f3f3f1' },
    { id: 'agt_gri_deschis', label: 'Gri deschis', hex: '#d9d7d4' },
    { id: 'agt_antracit', label: 'Antracit', hex: '#303235' },
    { id: 'agt_cappuccino', label: 'Cappuccino / Bej', hex: '#c8b59a' },
    { id: 'agt_negru', label: 'Negru', hex: '#1f2124' },
    { id: 'agt_stejar_deschis', label: 'Stejar deschis', hex: '#c7a16b' },
  ]),
  'Carcasă PAL + Uși MDF înfoliat': withOther([
    { id: 'inf_alb_mat', label: 'Alb mat', hex: '#f3f3f1' },
    { id: 'inf_alb_lucios', label: 'Alb lucios', hex: '#ffffff' },
    { id: 'inf_crem', label: 'Crem / Ivory', hex: '#efe6d6' },
    { id: 'inf_gri_deschis', label: 'Gri deschis', hex: '#d9d7d4' },
    { id: 'inf_gri_antracit', label: 'Gri antracit', hex: '#303235' },
    { id: 'inf_negru_mat', label: 'Negru mat', hex: '#1f2124' },
    { id: 'inf_stejar', label: 'Stejar', hex: '#b9935a' },
    { id: 'inf_nuc', label: 'Nuc', hex: '#6a4b36' },
  ]),
  'Carcasă PAL + Uși MDF vopsit': withOther([
    { id: 'vop_alb', label: 'Alb (mat)', hex: '#f3f3f1' },
    { id: 'vop_negru', label: 'Negru (mat)', hex: '#1f2124' },
    { id: 'vop_gri_deschis', label: 'Gri deschis (mat)', hex: '#d9d7d4' },
    { id: 'vop_gri_antracit', label: 'Gri antracit (mat)', hex: '#303235' },
    { id: 'vop_bej', label: 'Bej / Greige (mat)', hex: '#c8b59a' },
    { id: 'vop_verde_olive', label: 'Verde olive (mat)', hex: '#53624a' },
    { id: 'vop_albastru_petrol', label: 'Albastru petrol (mat)', hex: '#0b4a55' },
  ]),
}

export function getColorsForMaterial(materialKey) {
  const list = COLORS_BY_MATERIAL[materialKey]
  if (Array.isArray(list) && list.length) return list
  return [{ id: OTHER_COLOR_ID, label: OTHER_COLOR_LABEL, hex: '#e7e7e2' }]
}

export function isColorValidForMaterial(materialKey, colorId) {
  if (!colorId) return false
  return getColorsForMaterial(materialKey).some((c) => c.id === colorId)
}

export function getColorOption(materialKey, colorId) {
  if (!colorId) return null
  return getColorsForMaterial(materialKey).find((c) => c.id === colorId) || null
}
