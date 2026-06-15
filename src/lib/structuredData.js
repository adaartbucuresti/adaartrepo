export const businessName = 'Ada Art Design'
export const legalBusinessName = 'ADA ART MOB SRL'
export const businessUrl = 'https://adaart.ro'
export const businessPhone = '+40 0722 648 175'
export const businessLogoUrl = `${businessUrl}/logo.svg`

export function buildBaseStructuredData() {
  const organizationId = `${businessUrl}/#organization`
  const websiteId = `${businessUrl}/#website`
  const storeId = `${businessUrl}/#store`

  return {
    organizationId,
    websiteId,
    storeId,
    graph: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': organizationId,
        name: businessName,
        legalName: legalBusinessName,
        url: businessUrl,
        logo: businessLogoUrl,
        image: businessLogoUrl,
        telephone: businessPhone,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': websiteId,
        url: businessUrl,
        name: businessName,
        publisher: { '@id': organizationId },
        inLanguage: 'ro-RO',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FurnitureStore',
        '@id': storeId,
        name: businessName,
        url: businessUrl,
        image: businessLogoUrl,
        logo: businessLogoUrl,
        telephone: businessPhone,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bucuresti',
          addressRegion: 'Sector 2',
          addressCountry: 'RO',
        },
        areaServed: [
          { '@type': 'City', name: 'Bucuresti' },
          { '@type': 'Country', name: 'Romania' },
        ],
        availableLanguage: ['ro'],
        parentOrganization: { '@id': organizationId },
      },
    ],
  }
}

export function upsertJsonLdScript(id, data) {
  if (typeof document === 'undefined') return () => {}

  const selector = `script[data-schema-id="${id}"]`
  let script = document.head.querySelector(selector)
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-schema-id', id)
    document.head.appendChild(script)
  }

  const previous = script.textContent
  script.textContent = JSON.stringify(data)

  return () => {
    if (!script) return
    if (previous === null || previous === '') script.remove()
    else script.textContent = previous
  }
}
