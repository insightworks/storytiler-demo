import { cn } from './format'

const PALETTE: Record<string, { bg: string; skin: string; hair: string; shirt: string; style: 'short' | 'long' | 'bob' | 'crop' }> = {
  fredrik: { bg: '#e5eedc', skin: '#e2b08a', hair: '#3a2e28', shirt: '#4d6737', style: 'short' },
  nora: { bg: '#eae4fa', skin: '#f0c2a4', hair: '#2b211c', shirt: '#6554c0', style: 'long' },
  elias: { bg: '#def0f7', skin: '#e4b896', hair: '#1c2428', shirt: '#255c73', style: 'crop' },
  saga: { bg: '#fbe3d6', skin: '#edc3a4', hair: '#6a3a1e', shirt: '#8a4c2e', style: 'bob' },
  amir: { bg: '#e5eedc', skin: '#c9926a', hair: '#1a1714', shirt: '#4d6737', style: 'short' },
  liv: { bg: '#f0e0f2', skin: '#f0c8b4', hair: '#241818', shirt: '#7a3e6d', style: 'bob' },
  noel: { bg: '#def0f7', skin: '#e8c4a4', hair: '#2c261c', shirt: '#255c73', style: 'crop' },
  human: { bg: '#e5eedc', skin: '#e6c2a2', hair: '#3d342c', shirt: '#4d6737', style: 'short' },
}

export function Mark({ size = 33 }: { size?: number }) {
  return (
    <span className="mark-letter" style={{ width: size, height: size, fontSize: Math.round(size * 0.72) }} aria-hidden="true">
      f
    </span>
  )
}

export function AiBadge() {
  return <span className="ai-badge">AI</span>
}

export function Portrait({ look, name, size = 36 }: { look: string; name: string; size?: number }) {
  const pal = PALETTE[look] ?? PALETTE.human
  const hair =
    pal.style === 'long' ? (
      <path d="M18 48c1-22 12-30 22-30s21 8 22 30c1 12-2 22-7 28-6-12-11-14-15-14s-9 2-15 14c-5-6-8-16-7-28z" fill={pal.hair} />
    ) : pal.style === 'bob' ? (
      <path d="M16 52c2-24 12-32 24-32s22 8 24 32c0 8-5 16-9 18-5-10-9-12-15-12s-10 2-15 12c-4-2-9-10-9-18z" fill={pal.hair} />
    ) : pal.style === 'crop' ? (
      <path d="M24 46c1-16 8-24 16-24s15 8 16 24c-4-6-10-8-16-8s-12 2-16 8z" fill={pal.hair} />
    ) : (
      <path d="M22 46c0-16 8-24 18-24s18 8 18 24c-3-7-10-10-18-10s-15 3-18 10z" fill={pal.hair} />
    )
  return (
    <svg className="portrait" width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={name}>
      <circle cx="40" cy="40" r="40" fill={pal.bg} />
      {hair}
      <circle cx="40" cy="46" r="16" fill={pal.skin} />
      <circle cx="34" cy="46" r="1.7" fill="#2a2420" />
      <circle cx="46" cy="46" r="1.7" fill="#2a2420" />
      <path d="M35 53c1.8 1.8 8.2 1.8 10 0" stroke="#8a5344" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M14 80c6-16 14-22 26-22s20 6 26 22" fill={pal.shirt} />
    </svg>
  )
}

export function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconAttach() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M7.2 9.6 12 4.8a2.3 2.3 0 0 1 3.2 3.2l-6.1 6.1a3.4 3.4 0 0 1-4.8-4.8l5.6-5.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconMic() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="6.2" y="2" width="5.6" height="9" rx="2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 8.5a5 5 0 0 0 10 0M9 13.5V16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.4 10.4 13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Presence({ look, name, size = 28 }: { look: string; name: string; size?: number }) {
  return (
    <span className={cn('avatar')} style={{ width: size, height: size }}>
      <Portrait look={look} name={name} size={size} />
      <i className="dot" />
    </span>
  )
}
