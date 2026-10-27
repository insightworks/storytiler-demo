const SHORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const FULL = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
]

let seq = 0

export function uid(prefix = 'id'): string {
  seq += 1
  return `${prefix}-${seq.toString(36)}`
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function formatStamp(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${SHORT[d.getMonth()]} ${hh}:${mm}`
}

export function formatDay(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${FULL[d.getMonth()]} ${d.getFullYear()}`
}

export function formatShort(isoDate: string): string {
  const [y, m, day] = isoDate.split('-').map(Number)
  if (!y || !m || !day) return isoDate
  return `${day} ${SHORT[m - 1]} ${y}`
}

export function statusLabel(status: 'todo' | 'doing' | 'waiting' | 'done'): string {
  if (status === 'todo') return 'Att göra'
  if (status === 'doing') return 'Pågår'
  if (status === 'waiting') return 'Väntar på input'
  return 'Klart'
}
