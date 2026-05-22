let logoSvgTextPromise = null
let logoImagePromise = null

const getLogoSvgText = async () => {
  if (logoSvgTextPromise) return logoSvgTextPromise
  logoSvgTextPromise = fetch('/logo.svg')
    .then((r) => {
      if (!r.ok) throw new Error('Nu am putut încărca logo-ul.')
      return r.text()
    })
    .catch(() => '')
  return logoSvgTextPromise
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Nu am putut citi imaginea.'))
    img.src = src
  })

const getLogoImage = async () => {
  if (logoImagePromise) return logoImagePromise
  logoImagePromise = Promise.resolve()
    .then(async () => {
      const svgText = await getLogoSvgText()
      if (!svgText) return null
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`
      return loadImage(dataUrl)
    })
    .catch(() => null)
  return logoImagePromise
}

const applyLogoWatermark = async (ctx, canvasW, canvasH, opts) => {
  const logo = await getLogoImage()
  if (!logo) return

  const color = opts?.color || '#FFFFFF'
  const opacity = typeof opts?.opacity === 'number' ? opts.opacity : 0.14
  const padding = Math.max(10, Math.round(canvasW * (opts?.paddingRatio ?? 0.03)))
  const targetW = Math.max(110, Math.min(Math.round(canvasW * (opts?.widthRatio ?? 0.22)), 420))

  const lw = logo.naturalWidth || logo.width || 300
  const lh = logo.naturalHeight || logo.height || 120
  const ratio = lh ? lw / lh : 2.5
  const targetH = Math.max(1, Math.round(targetW / ratio))

  const off = document.createElement('canvas')
  off.width = targetW
  off.height = targetH
  const octx = off.getContext('2d')
  if (!octx) return
  octx.drawImage(logo, 0, 0, targetW, targetH)
  octx.globalCompositeOperation = 'source-in'
  octx.fillStyle = color
  octx.fillRect(0, 0, targetW, targetH)
  octx.globalCompositeOperation = 'source-over'

  const x = Math.max(0, canvasW - targetW - padding)
  const y = Math.max(0, canvasH - targetH - padding)
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.drawImage(off, x, y, targetW, targetH)
  ctx.restore()
}

export const fileToWatermarkedJpegBlob = async (file, options) => {
  const maxW = options?.maxW ?? 1800
  const maxH = options?.maxH ?? 1800
  const quality = options?.quality ?? 0.86

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)

    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    if (!w || !h) throw new Error('Imagine invalidă.')

    const scale = Math.min(1, maxW / w, maxH / h)
    const outW = Math.max(1, Math.round(w * scale))
    const outH = Math.max(1, Math.round(h * scale))

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Nu am putut procesa imaginea.')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outW, outH)
    ctx.drawImage(img, 0, 0, outW, outH)

    if (options?.watermark !== false) {
      await applyLogoWatermark(ctx, outW, outH, options?.watermarkOptions)
    }

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) reject(new Error('Nu am putut procesa imaginea.'))
          else resolve(b)
        },
        'image/jpeg',
        quality,
      )
    })
    return blob
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export const fileToWatermarkedJpegDataUrl = async (file, options) => {
  const blob = await fileToWatermarkedJpegBlob(file, options)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Nu am putut procesa imaginea.'))
    reader.readAsDataURL(blob)
  })
}
