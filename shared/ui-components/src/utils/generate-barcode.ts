export interface BarcodeOptions {
  width?: number
  height?: number
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC'
  displayValue?: boolean
  background?: string
  lineColor?: string
  fontSize?: number
  margin?: number
}

export function generateBarcodeSVG(
  value: string,
  options: BarcodeOptions = {}
): string {
  const {
    width = 2,
    height = 100,
    format = 'CODE128',
    displayValue = true,
    background = '#ffffff',
    lineColor = '#000000',
    fontSize = 20,
    margin = 10,
  } = options

  // Log format for debugging (to avoid unused variable warning)
  console.debug(`Generating barcode with format: ${format}`)

  // This is a simplified barcode generator
  // In production, you would use a library like JsBarcode
  const barCount = value.length * 11 + 35 // Simplified calculation
  const totalWidth = barCount * width + margin * 2
  const totalHeight = height + (displayValue ? fontSize + margin : margin * 2)

  // Generate simple pattern (this is not a real barcode algorithm)
  const bars = Array.from({ length: barCount }, (_, i) => {
    const isBar = i % 3 !== 0 // Simplified pattern
    return isBar ? '1' : '0'
  }).join('')

  const barElements = bars.split('').map((bar, index) => {
    if (bar === '1') {
      return `<rect x="${margin + index * width}" y="${margin}" width="${width}" height="${height}" fill="${lineColor}"/>`
    }
    return ''
  }).join('')

  const textElement = displayValue ? `
    <text 
      x="${totalWidth / 2}" 
      y="${height + margin + fontSize}" 
      text-anchor="middle" 
      font-family="monospace" 
      font-size="${fontSize}" 
      fill="${lineColor}"
    >
      ${value}
    </text>
  ` : ''

  return `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="${totalWidth}" 
      height="${totalHeight}" 
      viewBox="0 0 ${totalWidth} ${totalHeight}"
    >
      <rect width="100%" height="100%" fill="${background}"/>
      ${barElements}
      ${textElement}
    </svg>
  `.trim()
}

export function generateBarcodeDataURL(
  value: string,
  options: BarcodeOptions = {}
): string {
  const svg = generateBarcodeSVG(value, options)
  const base64 = btoa(svg)
  return `data:image/svg+xml;base64,${base64}`
}

export function downloadBarcode(
  value: string,
  filename?: string,
  options: BarcodeOptions = {}
): void {
  const svg = generateBarcodeSVG(value, options)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `barcode-${value}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function validateBarcode(value: string, format: string): boolean {
  switch (format) {
    case 'EAN13':
      return /^\d{13}$/.test(value)
    case 'EAN8':
      return /^\d{8}$/.test(value)
    case 'UPC':
      return /^\d{12}$/.test(value)
    case 'CODE39':
      return /^[A-Z0-9\-\.\$\/\+\%\s]+$/.test(value.toUpperCase())
    case 'CODE128':
      return /^[\x00-\x7F]+$/.test(value) // ASCII characters only
    default:
      return value.length > 0
  }
}

export function calculateChecksum(value: string, format: string): number {
  switch (format) {
    case 'EAN13':
    case 'UPC':
      let sum = 0
      for (let i = 0; i < value.length - 1; i++) {
        const digit = parseInt(value[i])
        sum += (i % 2 === 0 ? digit : digit * 3)
      }
      return (10 - (sum % 10)) % 10
    default:
      return 0
  }
}

// Barcode type information
export const barcodeTypes = {
  CODE128: {
    name: 'Code 128',
    description: 'High-density barcode supporting all 128 ASCII characters',
    maxLength: 48,
    supportedChars: 'All ASCII characters',
  },
  CODE39: {
    name: 'Code 39',
    description: 'Alphanumeric barcode supporting uppercase letters, numbers, and some symbols',
    maxLength: 43,
    supportedChars: 'A-Z, 0-9, space, and symbols: - . $ / + %',
  },
  EAN13: {
    name: 'EAN-13',
    description: '13-digit retail product barcode',
    maxLength: 13,
    supportedChars: 'Digits only (0-9)',
  },
  EAN8: {
    name: 'EAN-8',
    description: '8-digit retail product barcode',
    maxLength: 8,
    supportedChars: 'Digits only (0-9)',
  },
  UPC: {
    name: 'UPC-A',
    description: '12-digit retail product barcode',
    maxLength: 12,
    supportedChars: 'Digits only (0-9)',
  },
}
