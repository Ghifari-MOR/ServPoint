export const DEFAULT_CATEGORY = 'Semua Kategori'

export const CATEGORY_OPTIONS = [
  'Handphone',
  'Laptop & PC',
  'Smartwatch',
  'Tablet',
  'TWS & Headphone',
  'Kamera Digital',
  'Printer & Scanner',
  'Konsol Game',
  'TV & Monitor',
]

const CATEGORY_ALIASES = {
  Handphone: ['Handphone', 'Smartphone & HP', 'Smarthphone & HP'],
  'Laptop & PC': ['Laptop & PC', 'PC&Laptop', 'PC & Laptop'],
}

export function normalizeCategoryLabel(category) {
  const value = (category || '').trim()
  if (!value) return ''

  const lowered = value.toLowerCase()
  for (const [canonical, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((alias) => alias.toLowerCase() === lowered)) {
      return canonical
    }
  }

  return value
}
