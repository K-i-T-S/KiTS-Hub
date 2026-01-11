export interface EmailValidationOptions {
  allowDisplayName?: boolean
  requireDisplayName?: boolean
  allowUtf8LocalPart?: boolean
  requireTld?: boolean
}

export function validateEmail(
  email: string,
  options: EmailValidationOptions = {}
): boolean {
  const {
    allowDisplayName = false,
    requireDisplayName = false,
    allowUtf8LocalPart = true,
    requireTld = true,
  } = options

  if (!email || typeof email !== 'string') {
    return false
  }

  // Remove leading/trailing whitespace
  email = email.trim()

  // Check for display name format: "Display Name <email@domain.com>"
  const displayNameMatch = email.match(/^([^<>\s]+)\s<(.+)>$/)
  if (displayNameMatch) {
    const [, displayName, emailAddress] = displayNameMatch
    if (!allowDisplayName) {
      return false
    }
    if (requireDisplayName && !displayName.trim()) {
      return false
    }
    email = emailAddress
  } else if (requireDisplayName) {
    return false
  }

  // Basic email structure validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return false
  }

  const [localPart, domain] = email.split('@')

  // Validate local part
  if (!validateLocalPart(localPart, allowUtf8LocalPart)) {
    return false
  }

  // Validate domain
  if (!validateDomain(domain, requireTld)) {
    return false
  }

  return true
}

function validateLocalPart(localPart: string, allowUtf8: boolean): boolean {
  if (!localPart || localPart.length === 0) {
    return false
  }

  if (localPart.length > 64) {
    return false
  }

  // Check for invalid characters
  const validChars = allowUtf8 
    ? /^[\p{L}\p{N}!#$%&'*+/=?^_`{|}~.-]+$/u
    : /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/

  if (!validChars.test(localPart)) {
    return false
  }

  // Cannot start or end with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false
  }

  // Cannot have consecutive dots
  if (localPart.includes('..')) {
    return false
  }

  return true
}

function validateDomain(domain: string, requireTld: boolean): boolean {
  if (!domain || domain.length === 0) {
    return false
  }

  if (domain.length > 253) {
    return false
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
    return false
  }

  // Cannot start or end with dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    return false
  }

  // Cannot have consecutive dots
  if (domain.includes('..')) {
    return false
  }

  const labels = domain.split('.')
  
  // Must have at least 2 labels if TLD is required
  if (requireTld && labels.length < 2) {
    return false
  }

  // Validate each label
  for (const label of labels) {
    if (label.length === 0 || label.length > 63) {
      return false
    }

    // Each label must start and end with alphanumeric
    if (!/^[a-zA-Z0-9]/.test(label) || !/[a-zA-Z0-9]$/.test(label)) {
      return false
    }

    // Cannot have consecutive hyphens
    if (label.includes('--')) {
      return false
    }
  }

  // Check TLD if required
  if (requireTld) {
    const tld = labels[labels.length - 1]
    
    // TLD must be at least 2 characters
    if (tld.length < 2) {
      return false
    }

    // Common TLD patterns
    const tldRegex = /^[a-zA-Z]{2,}$/
    if (!tldRegex.test(tld)) {
      return false
    }
  }

  return true
}

export function normalizeEmail(email: string): string {
  if (!validateEmail(email)) {
    return email
  }

  email = email.trim().toLowerCase()

  // Remove display name if present
  const match = email.match(/<(.+)>$/)
  if (match) {
    email = match[1]
  }

  return email
}

export function extractDomain(email: string): string | null {
  if (!validateEmail(email)) {
    return null
  }

  const normalized = normalizeEmail(email)
  const parts = normalized.split('@')
  return parts.length === 2 ? parts[1] : null
}

export function isDisposableEmail(email: string): boolean {
  const domain = extractDomain(email)
  if (!domain) return true

  // List of common disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'throwaway.email',
    'temp-mail.org',
    'maildrop.cc',
    '20minutemail.com',
    'mail2trash.com',
  ]

  return disposableDomains.includes(domain.toLowerCase())
}

export function isCorporateEmail(email: string): boolean {
  const domain = extractDomain(email)
  if (!domain) return false

  // Common personal email providers
  const personalDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'tutanota.com',
  ]

  return !personalDomains.includes(domain.toLowerCase())
}

export function suggestEmailCorrection(email: string): string[] {
  const suggestions: string[] = []
  
  if (!validateEmail(email)) {
    return suggestions
  }

  const domain = extractDomain(email)
  if (!domain) return suggestions

  // Common domain typos and corrections
  const commonTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.con': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahho.com': 'yahoo.com',
    'hotmal.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outlook.co': 'outlook.com',
  }

  if (commonTypos[domain.toLowerCase()]) {
    const correctedDomain = commonTypos[domain.toLowerCase()]
    const localPart = email.split('@')[0]
    suggestions.push(`${localPart}@${correctedDomain}`)
  }

  return suggestions
}
