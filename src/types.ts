export type Kind = 'dashboard' | 'launch' | 'service' | 'custom'
export type Phase = 'start' | 'brief' | 'review' | 'app'
export type Origin = 'confirmed' | 'assumption'
export type SectionId =
  | 'name'
  | 'background'
  | 'goals'
  | 'audience'
  | 'scope'
  | 'deliverables'
  | 'sources'
  | 'constraints'
  | 'success'
  | 'assumptions'
export type ItemSection = Exclude<SectionId, 'name' | 'assumptions'>
export type Status = 'todo' | 'doing' | 'waiting' | 'done'
export type AppSection = 'overview' | 'tasks' | 'chat' | 'activities' | 'team' | 'brief' | 'settings'
export type RightMode = 'agent' | 'chat'

export interface BriefItem {
  id: string
  sectionId: ItemSection
  text: string
  origin: Origin
  questionId?: string
}

export interface OpenQuestion {
  id: string
  questionId: string
  text: string
}

export interface BriefMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  chips?: string[]
}

export interface Brief {
  kind: Kind
  projectName: string
  nameOrigin: Origin
  items: BriefItem[]
  openQuestions: OpenQuestion[]
  messages: BriefMessage[]
  cursor: number
  asked: string[]
  resolved: string[]
}

export interface Person {
  id: string
  name: string
  email?: string
  kind: 'human' | 'agent'
  role: string
  skills: string[]
  why: string
  examples: string[]
  look: string
  lead?: boolean
}

export interface ChatLink {
  label: string
  activityKey: string
}

export interface ChatMessage {
  id: string
  authorId: string
  text: string
  createdAt: string
  proposal?: boolean
  links?: ChatLink[]
  inviteHint?: boolean
  attachmentName?: string
  decisionId?: string
  activityId?: string
}

export interface Chat {
  id: string
  kind: 'project' | 'group' | 'dm'
  title: string
  participantIds: string[]
  messages: ChatMessage[]
}

export interface Activity {
  id: string
  key: string
  title: string
  description: string
  ownerId: string
  contributorIds: string[]
  status: Status
  deadline?: string
  dependsOn: string[]
  blockers: string[]
  agentCanStart: boolean
  needsHuman?: string
  chatId?: string
  messageId?: string
}

export interface Decision {
  id: string
  content: string
  createdAt: string
  chatId: string
  messageId: string
}

export interface Project {
  id: string
  kind: Kind
  name: string
  brief: Brief
  people: Person[]
  chats: Chat[]
  activities: Activity[]
  decisions: Decision[]
  createdAt: string
}

export interface ActivityDraft {
  chatId: string
  messageId: string
  title: string
  description: string
  ownerId: string
}

export interface DecisionDraft {
  chatId: string
  messageId: string
  content: string
}

export interface Huddle {
  participantIds: string[]
  muted: boolean
  startedAt: number
}

export interface State {
  phase: Phase
  brief: Brief | null
  briefTyping: boolean
  project: Project | null
  teamIds: string[]
  extras: Person[]
  section: AppSection
  activeChatId: string | null
  composer: string
  typing: { chatId: string; personId: string } | null
  rightOpen: boolean
  rightMode: RightMode
  focusPersonId: string | null
  huddle: Huddle | null
  inviteOpen: boolean
  groupOpen: boolean
  addPersonOpen: boolean
  activityDraft: ActivityDraft | null
  decisionDraft: DecisionDraft | null
  openActivityId: string | null
  highlightActivityId: string | null
  focusMessageId: string | null
  search: string
  listening: boolean
  activityView: 'list' | 'board'
}

export interface Chip {
  label: string
  text: string
  also?: { sectionId: ItemSection; text: string }[]
}

export interface Question {
  id: string
  sectionId: ItemSection
  prompt: string
  openText: string
  keywords: string[]
  chips: Chip[]
  assumption: string
}

export interface ActivityTemplate {
  key: string
  title: string
  description: string
  ownerId: string
  contributorIds?: string[]
  status: Status
  deadline?: string
  dependsOn: string[]
  blockers: string[]
  agentCanStart: boolean
  needsHuman?: string
}

export interface PhasePlan {
  title: string
  period: string
  detail: string
}

export interface Milestone {
  date: string
  title: string
}

export type SearchHit =
  | { type: 'project'; label: string }
  | { type: 'person'; id: string; label: string; meta: string }
  | { type: 'message'; chatId: string; messageId: string; label: string; meta: string }
  | { type: 'activity'; id: string; label: string; meta: string }
