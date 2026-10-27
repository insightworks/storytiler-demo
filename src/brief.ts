import {
  defaultName,
  detectKind,
  initialItems,
  openingFor,
  questionsFor,
} from './content'
import { uid } from './format'
import type { Brief, BriefItem, Chip, ItemSection, Question } from './types'

export interface BriefReply {
  text: string
  chips: string[]
}

function item(sectionId: ItemSection, text: string, origin: BriefItem['origin'], questionId?: string): BriefItem {
  return { id: uid('b'), sectionId, text, origin, questionId }
}

export function chipsFor(brief: Brief): string[] {
  const plan = questionsFor(brief.kind)
  const chips: string[] = []
  for (const id of brief.asked) {
    const q = plan.find((entry) => entry.id === id)
    if (!q) continue
    for (const c of q.chips) {
      if (!chips.includes(c.label)) chips.push(c.label)
    }
  }
  if (brief.asked.length && !chips.includes('Vet inte ännu')) chips.push('Vet inte ännu')
  return chips
}

export function createBrief(userText: string): { brief: Brief; reply: BriefReply } {
  const kind = detectKind(userText)
  const plan = questionsFor(kind)
  const asked = plan.slice(0, 2).map((q) => q.id)
  const brief: Brief = {
    kind,
    projectName: defaultName(kind, userText),
    nameOrigin: 'assumption',
    items: initialItems(kind, userText).map((entry) => item(entry.sectionId, entry.text, entry.origin)),
    openQuestions: plan.map((q) => ({ id: uid('q'), questionId: q.id, text: q.openText })),
    messages: [{ id: uid('m'), role: 'user', text: userText.trim() }],
    cursor: Math.min(2, plan.length),
    asked,
    resolved: [],
  }
  return { brief, reply: { text: openingFor(kind), chips: chipsFor(brief) } }
}

function isUnknown(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[.!]+$/g, '')
  return t === 'vet inte ännu' || t === 'vet inte' || t === 'vet ej' || t === 'osäker' || t === 'ingen aning'
}

type Edit =
  | { type: 'rename'; name: string }
  | { type: 'add'; text: string }
  | { type: 'confirm-assumptions' }
  | { type: 'clear-assumptions' }

function clean(value: string): string {
  return value.replace(/^[”"'«]+|[”"'».!]+$/g, '').trim()
}

function parseEdit(text: string): Edit | null {
  const name = text.match(
    /(?:byt namn till|döp(?:\s+om)?(?:\s+projektet)? till|projektnamnet ska vara|kalla projektet)\s+(.+)/i,
  )
  if (name) return { type: 'rename', name: clean(name[1]) }
  const add = text.match(/^lägg till(?: i briefen)?(?: att)?\s+(.+)/i)
  if (add) return { type: 'add', text: clean(add[1]) }
  if (/antagandena stämmer|gör antaganden till fakta/i.test(text)) return { type: 'confirm-assumptions' }
  if (/ta bort antaganden/i.test(text)) return { type: 'clear-assumptions' }
  return null
}

function resolveConfirmed(brief: Brief, q: Question, text: string, also?: Chip['also']): Brief {
  const items = brief.items.filter((entry) => !(entry.questionId === q.id && entry.origin === 'assumption'))
  items.push(item(q.sectionId, text, 'confirmed', q.id))
  for (const extra of also ?? []) items.push(item(extra.sectionId, extra.text, 'confirmed', q.id))
  return {
    ...brief,
    items,
    openQuestions: brief.openQuestions.filter((entry) => entry.questionId !== q.id),
    resolved: brief.resolved.includes(q.id) ? brief.resolved : [...brief.resolved, q.id],
    asked: brief.asked.filter((id) => id !== q.id),
  }
}

function resolveUnknown(brief: Brief, q: Question): Brief {
  const items = brief.items.filter((entry) => !(entry.questionId === q.id && entry.origin === 'assumption'))
  items.push(item(q.sectionId, q.assumption, 'assumption', q.id))
  return {
    ...brief,
    items,
    resolved: brief.resolved.includes(q.id) ? brief.resolved : [...brief.resolved, q.id],
    asked: brief.asked.filter((id) => id !== q.id),
  }
}

function pullNext(brief: Brief): Brief {
  const plan = questionsFor(brief.kind)
  if (brief.asked.length > 0) return brief
  const more = plan.slice(brief.cursor, brief.cursor + 2)
  return { ...brief, asked: more.map((q) => q.id), cursor: brief.cursor + more.length }
}

function askedQuestions(brief: Brief): Question[] {
  const plan = questionsFor(brief.kind)
  return brief.asked.map((id) => plan.find((q) => q.id === id)).filter((q): q is Question => Boolean(q))
}

function compose(brief: Brief, resolved: { how: 'confirmed' | 'unknown' }[]): string {
  const known = resolved.some((entry) => entry.how === 'confirmed')
  const unknown = resolved.some((entry) => entry.how === 'unknown')
  const parts: string[] = []
  if (known && unknown) {
    parts.push('Det jag fick in är bekräftat i briefen. Resten lämnar jag som öppen fråga, med ett antagande så vi inte fastnar.')
  } else if (known) {
    parts.push('Jag har lagt in det som bekräftat i briefen.')
  } else if (unknown) {
    parts.push('Då låter jag det vara öppet och skriver ett antagande, så du ser vad jag utgår från.')
  }
  const asked = askedQuestions(brief)
  if (asked.length === 0) {
    parts.push('Det räcker för att gå vidare. Läs igenom briefen, ändra det som inte stämmer, och godkänn när du är nöjd. Öppna frågor får följa med.')
  } else {
    parts.push(asked.map((q) => q.prompt).join('\n'))
  }
  return parts.join('\n\n')
}

function sectionForAdd(text: string, brief: Brief): ItemSection {
  const plan = questionsFor(brief.kind)
  const hit = plan.find((q) => q.keywords.some((k) => text.toLowerCase().includes(k)))
  return hit?.sectionId ?? 'background'
}

function applyEdit(brief: Brief, edit: Edit): Brief {
  if (edit.type === 'rename') {
    return { ...brief, projectName: edit.name || brief.projectName, nameOrigin: 'confirmed' }
  }
  if (edit.type === 'add') {
    return { ...brief, items: [...brief.items, item(sectionForAdd(edit.text, brief), edit.text, 'confirmed')] }
  }
  if (edit.type === 'confirm-assumptions') {
    return {
      ...brief,
      nameOrigin: brief.nameOrigin === 'assumption' ? 'confirmed' : brief.nameOrigin,
      items: brief.items.map((entry) => (entry.origin === 'assumption' ? { ...entry, origin: 'confirmed' } : entry)),
    }
  }
  return { ...brief, items: brief.items.filter((entry) => entry.origin !== 'assumption') }
}

function editReply(brief: Brief, edit: Edit): string {
  const base =
    edit.type === 'rename'
      ? `Projektnamnet är nu ${brief.projectName}. Jag har markerat det som bekräftat.`
      : edit.type === 'add'
        ? 'Jag har lagt till det som bekräftat i briefen.'
        : edit.type === 'confirm-assumptions'
          ? 'Då markerar jag antagandena som bekräftade.'
          : 'Jag har tagit bort antagandena ur briefen.'
  const asked = askedQuestions(brief)
  if (!asked.length) return `${base}\n\nBriefen kan godkännas när du är nöjd.`
  return `${base}\n\n${asked.map((q) => q.prompt).join('\n')}`
}

export function applyUserTurn(brief: Brief, text: string): { brief: Brief; reply: BriefReply } {
  const trimmed = text.trim()
  let next: Brief = { ...brief, messages: [...brief.messages, { id: uid('m'), role: 'user', text: trimmed }] }
  const edit = parseEdit(trimmed)
  if (edit) {
    next = applyEdit(next, edit)
    return { brief: next, reply: { text: editReply(next, edit), chips: chipsFor(next) } }
  }

  const asked = askedQuestions(next)
  const resolved: { how: 'confirmed' | 'unknown' }[] = []
  if (isUnknown(trimmed)) {
    for (const q of asked) {
      next = resolveUnknown(next, q)
      resolved.push({ how: 'unknown' })
    }
  } else {
    const chipHits = asked.filter((q) => q.chips.some((c) => c.label.toLowerCase() === trimmed.toLowerCase()))
    if (chipHits.length) {
      for (const q of chipHits) {
        const match = q.chips.find((c) => c.label.toLowerCase() === trimmed.toLowerCase())!
        next = resolveConfirmed(next, q, match.text, match.also)
        resolved.push({ how: 'confirmed' })
      }
    } else {
      const keywordHits = asked.filter((q) => q.keywords.some((k) => trimmed.toLowerCase().includes(k)))
      const hits = keywordHits.length ? keywordHits : asked.slice(0, 1)
      for (const q of hits) {
        next = resolveConfirmed(next, q, trimmed)
        resolved.push({ how: 'confirmed' })
      }
    }
  }
  next = pullNext(next)
  return { brief: next, reply: { text: compose(next, resolved), chips: chipsFor(next) } }
}

export function renameBrief(brief: Brief, name: string): Brief {
  const trimmed = name.trim()
  if (!trimmed) return brief
  return { ...brief, projectName: trimmed, nameOrigin: 'confirmed' }
}

export function editItem(brief: Brief, id: string, text: string): Brief {
  return { ...brief, items: brief.items.map((entry) => (entry.id === id ? { ...entry, text } : entry)) }
}

export function confirmItem(brief: Brief, id: string): Brief {
  return {
    ...brief,
    items: brief.items.map((entry) => (entry.id === id ? { ...entry, origin: 'confirmed' } : entry)),
  }
}

export function removeItem(brief: Brief, id: string): Brief {
  return { ...brief, items: brief.items.filter((entry) => entry.id !== id) }
}
