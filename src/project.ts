import { activitiesFor, agentsFor, FREDRIK, SAMPLE_FILE } from './content'
import { formatDay, uid } from './format'
import type { Activity, ActivityDraft, Brief, Chat, ChatMessage, Person, Project, Status } from './types'

export function suggestActivity(message: ChatMessage, chatId: string): Omit<ActivityDraft, 'chatId' | 'messageId'> & { chatId: string; messageId: string } {
  const sentence = message.text
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .find(Boolean) ?? message.text
  const title = sentence.replace(/[.]+$/g, '').slice(0, 90)
  let ownerId = message.authorId === 'system' ? 'fredrik' : message.authorId
  if (/fredrik/i.test(message.text) && message.authorId !== 'fredrik') ownerId = 'fredrik'
  else if (message.authorId === 'fredrik' || message.authorId === 'system') {
    if (/diagram|visual/i.test(message.text)) ownerId = 'saga'
    else if (/kvalit|nyckeltal|pipeline|data/i.test(message.text)) ownerId = 'elias'
    else ownerId = 'fredrik'
  }
  return {
    chatId,
    messageId: message.id,
    title,
    description: message.text,
    ownerId,
  }
}

export function withStatus(activities: Activity[], id: string, status: Status): Activity[] {
  const current = activities.find((a) => a.id === id)
  let next = activities.map((a) => (a.id === id ? { ...a, status, blockers: status === 'done' ? [] : a.blockers } : a))
  if (current?.key === 'upload' && status === 'done') {
    next = next.map((a) =>
      a.key === 'quality' && a.status === 'waiting'
        ? { ...a, status: 'todo', blockers: [], agentCanStart: true, needsHuman: undefined }
        : a,
    )
  }
  if (current?.key === 'confirm-kpi' && status === 'done') {
    next = next.map((a) =>
      a.key === 'charts' && a.status === 'waiting'
        ? { ...a, status: 'todo', blockers: [], agentCanStart: true, needsHuman: undefined }
        : a,
    )
  }
  return next
}

export function markUploadDone(activities: Activity[]): Activity[] {
  return activities.map((a) => {
    if (a.key === 'upload') return { ...a, status: 'done', blockers: [], needsHuman: undefined }
    if (a.key === 'quality' && a.status === 'waiting') {
      return { ...a, status: 'todo', blockers: [], agentCanStart: true, needsHuman: undefined }
    }
    return a
  })
}

function opening(brief: Brief, now: string): ChatMessage[] {
  const nora =
    brief.kind === 'dashboard'
      ? `Hej Fredrik. Briefen för ${brief.projectName} är godkänd. Jag skulle låsa fyra nyckeltal i version 1: viktad pipeline, win rate, intäkt mot mål och säljcykelns längd. Då kan Karin Wallin på måndagsmötet 23 november se var insatserna ska läggas, utan att öppna Pipedrive och Fortnox. Säg till om något ska ändras.`
      : brief.kind === 'launch'
        ? `Hej Fredrik. Briefen för ${brief.projectName} är godkänd. Jag håller datumet och vad som måste vara klart innan. Fråga vad vi behöver göra härnäst så tar jag ordningen.`
        : `Hej Fredrik. Briefen för ${brief.projectName} är godkänd. Jag håller isär vad som ingår i första versionen och vad som får vänta. Fråga vad vi behöver göra härnäst så tar jag ordningen.`
  return [
    {
      id: uid('m'),
      authorId: 'system',
      text: `Projektet ${brief.projectName} är startat. Briefen godkändes ${formatDay(now)}.`,
      createdAt: now,
    },
    {
      id: uid('m'),
      authorId: 'nora',
      text: nora,
      createdAt: now,
      proposal: true,
    },
  ]
}

export function buildProject(brief: Brief, teamIds: string[], extras: Person[]): Project {
  const now = new Date().toISOString()
  const agents = agentsFor(brief.kind).filter((p) => teamIds.includes(p.id) || p.lead)
  const people = [FREDRIK, ...agents, ...extras.filter((p) => !agents.some((a) => a.id === p.id) && p.id !== 'fredrik')]
  const chatId = uid('chat')
  const chat: Chat = {
    id: chatId,
    kind: 'project',
    title: 'Projektchatt',
    participantIds: ['fredrik', 'nora'],
    messages: opening(brief, now),
  }
  return {
    id: uid('p'),
    kind: brief.kind,
    name: brief.projectName,
    brief: structuredClone(brief),
    people,
    chats: [chat],
    activities: activitiesFor(brief.kind).map((template) => ({
      ...template,
      id: uid('act'),
      contributorIds: template.contributorIds ?? [],
    })),
    decisions: [],
    createdAt: now,
  }
}

export function fileMessage(): ChatMessage {
  return {
    id: uid('m'),
    authorId: 'fredrik',
    text: 'Här är ett datautdrag för oktober.',
    createdAt: new Date().toISOString(),
    attachmentName: SAMPLE_FILE,
  }
}

export function userMessage(text: string): ChatMessage {
  return {
    id: uid('m'),
    authorId: 'fredrik',
    text,
    createdAt: new Date().toISOString(),
  }
}

export function incomingMessage(step: {
  authorId: string
  text: string
  proposal?: boolean
  links?: { label: string; activityKey: string }[]
  inviteHint?: boolean
}): ChatMessage {
  return {
    id: uid('m'),
    authorId: step.authorId,
    text: step.text,
    createdAt: new Date().toISOString(),
    proposal: step.proposal,
    links: step.links,
    inviteHint: step.inviteHint,
  }
}
