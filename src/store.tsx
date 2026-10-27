import { createContext, useContext, useReducer, useRef, type ReactNode } from 'react'
import { applyUserTurn, confirmItem, createBrief, editItem, removeItem, renameBrief } from './brief'
import { agentsFor, findPerson } from './content'
import { uid } from './format'
import { buildProject, fileMessage, incomingMessage, markUploadDone, suggestActivity, userMessage, withStatus } from './project'
import { attachmentReplies, humanJoinLine, joinFollowup, joinNotice, planReplies, type Outgoing } from './replies'
import type {
  Activity,
  ActivityDraft,
  AppSection,
  Brief,
  Decision,
  DecisionDraft,
  Huddle,
  Person,
  Project,
  RightMode,
  State,
  Status,
} from './types'

const initial: State = {
  phase: 'start',
  brief: null,
  briefTyping: false,
  project: null,
  teamIds: [],
  extras: [],
  section: 'chat',
  activeChatId: null,
  composer: '',
  typing: null,
  rightOpen: true,
  rightMode: 'agent',
  focusPersonId: null,
  huddle: null,
  inviteOpen: false,
  groupOpen: false,
  addPersonOpen: false,
  activityDraft: null,
  decisionDraft: null,
  openActivityId: null,
  highlightActivityId: null,
  focusMessageId: null,
  search: '',
  listening: false,
  activityView: 'list',
}

type Action =
  | { type: 'started'; brief: Brief }
  | { type: 'brief-user'; brief: Brief }
  | { type: 'brief-reply'; text: string; chips: string[] }
  | { type: 'brief-typing'; value: boolean }
  | { type: 'rename'; name: string }
  | { type: 'edit-item'; id: string; text: string }
  | { type: 'confirm-item'; id: string }
  | { type: 'remove-item'; id: string }
  | { type: 'approve' }
  | { type: 'back-brief' }
  | { type: 'toggle-member'; id: string }
  | { type: 'add-extra'; person: Person }
  | { type: 'remove-extra'; id: string }
  | { type: 'open-app' }
  | { type: 'phase'; phase: State['phase'] }
  | { type: 'section'; section: AppSection }
  | { type: 'chat'; id: string }
  | { type: 'composer'; text: string }
  | { type: 'outgoing'; chatId: string; text: string }
  | { type: 'incoming'; chatId: string; step: Outgoing }
  | { type: 'typing'; typing: State['typing'] }
  | { type: 'attach'; chatId: string }
  | { type: 'invite'; chatId: string; ids: string[] }
  | { type: 'group'; id: string; title: string; participantIds: string[] }
  | { type: 'dm'; personId: string; chatId: string }
  | { type: 'add-person-chat'; person: Person }
  | { type: 'right'; open: boolean }
  | { type: 'mode'; mode: RightMode }
  | { type: 'focus'; id: string | null }
  | { type: 'huddle'; huddle: Huddle | null }
  | { type: 'mute' }
  | { type: 'huddle-add'; id: string }
  | { type: 'activity-draft'; draft: ActivityDraft | null }
  | { type: 'patch-activity'; patch: Partial<ActivityDraft> }
  | { type: 'commit-activity'; id: string }
  | { type: 'decision-draft'; draft: DecisionDraft | null }
  | { type: 'patch-decision'; content: string }
  | { type: 'commit-decision'; id: string }
  | { type: 'status'; id: string; status: Status }
  | { type: 'show-activity'; id: string }
  | { type: 'open-activity'; id: string | null }
  | { type: 'focus-message'; chatId: string; messageId: string }
  | { type: 'search'; query: string }
  | { type: 'listen'; value: boolean }
  | { type: 'listen-done' }
  | { type: 'boards'; view: State['activityView'] }
  | { type: 'close-overlays' }
  | { type: 'overlay'; key: 'inviteOpen' | 'groupOpen' | 'addPersonOpen'; open: boolean }

function mapProject(state: State, project: Project): State {
  return { ...state, project }
}

function updateBrief(state: State, brief: Brief): State {
  if (state.phase === 'app' && state.project) {
    return mapProject(state, { ...state.project, name: brief.projectName, brief })
  }
  return { ...state, brief }
}

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case 'started':
      return { ...state, phase: 'brief', brief: action.brief, briefTyping: true }
    case 'brief-user':
      return { ...state, brief: action.brief, briefTyping: true }
    case 'brief-typing':
      return { ...state, briefTyping: action.value }
    case 'brief-reply': {
      if (state.phase !== 'brief' || !state.brief) return { ...state, briefTyping: false }
      return {
        ...state,
        briefTyping: false,
        brief: {
          ...state.brief,
          messages: [...state.brief.messages, { id: uid('m'), role: 'assistant', text: action.text, chips: action.chips }],
        },
      }
    }
    case 'rename': {
      if (state.phase === 'app' && state.project) return updateBrief(state, renameBrief(state.project.brief, action.name))
      if (!state.brief) return state
      return updateBrief(state, renameBrief(state.brief, action.name))
    }
    case 'edit-item': {
      const brief = state.phase === 'app' ? state.project?.brief : state.brief
      if (!brief) return state
      return updateBrief(state, editItem(brief, action.id, action.text))
    }
    case 'confirm-item': {
      const brief = state.phase === 'app' ? state.project?.brief : state.brief
      if (!brief) return state
      return updateBrief(state, confirmItem(brief, action.id))
    }
    case 'remove-item': {
      const brief = state.phase === 'app' ? state.project?.brief : state.brief
      if (!brief) return state
      return updateBrief(state, removeItem(brief, action.id))
    }
    case 'approve': {
      if (!state.brief) return state
      return { ...state, phase: 'review', teamIds: agentsFor(state.brief.kind).map((a) => a.id), extras: [], briefTyping: false }
    }
    case 'back-brief':
      return { ...state, phase: 'brief' }
    case 'toggle-member': {
      if (!state.brief) return state
      const person = agentsFor(state.brief.kind).find((a) => a.id === action.id)
      if (!person || person.lead) return state
      const has = state.teamIds.includes(action.id)
      return { ...state, teamIds: has ? state.teamIds.filter((id) => id !== action.id) : [...state.teamIds, action.id] }
    }
    case 'add-extra':
      return { ...state, extras: [...state.extras, action.person], addPersonOpen: false }
    case 'remove-extra':
      return { ...state, extras: state.extras.filter((p) => p.id !== action.id) }
    case 'open-app': {
      if (!state.brief) return state
      const project = buildProject(state.brief, state.teamIds, state.extras)
      return {
        ...state,
        phase: 'app',
        project,
        section: 'chat',
        activeChatId: project.chats[0]?.id ?? null,
        rightOpen: true,
        rightMode: 'agent',
        focusPersonId: null,
        composer: '',
        typing: null,
        search: '',
        huddle: null,
      }
    }
    case 'phase':
      return { ...state, phase: action.phase }
    case 'section':
      return { ...state, section: action.section, search: '' }
    case 'chat':
      return { ...state, activeChatId: action.id, section: 'chat', focusMessageId: null }
    case 'composer':
      return { ...state, composer: action.text }
    case 'outgoing': {
      if (!state.project) return state
      return mapProject(
        { ...state, composer: '' },
        {
          ...state.project,
          chats: state.project.chats.map((chat) =>
            chat.id === action.chatId ? { ...chat, messages: [...chat.messages, userMessage(action.text)] } : chat,
          ),
        },
      )
    }
    case 'incoming': {
      if (!state.project) return { ...state, typing: null }
      return mapProject(
        { ...state, typing: null },
        {
          ...state.project,
          chats: state.project.chats.map((chat) =>
            chat.id === action.chatId ? { ...chat, messages: [...chat.messages, incomingMessage(action.step)] } : chat,
          ),
        },
      )
    }
    case 'typing':
      return { ...state, typing: action.typing }
    case 'attach': {
      if (!state.project) return state
      const activities = state.project.kind === 'dashboard' ? markUploadDone(state.project.activities) : state.project.activities
      return mapProject(state, {
        ...state.project,
        activities,
        chats: state.project.chats.map((chat) =>
          chat.id === action.chatId ? { ...chat, messages: [...chat.messages, fileMessage()] } : chat,
        ),
      })
    }
    case 'invite': {
      if (!state.project) return state
      const additions = action.ids
        .filter((id) => !state.project!.people.some((p) => p.id === id))
        .map((id) => findPerson(id, state.project!.kind))
        .filter((p): p is Person => Boolean(p))
      return mapProject(
        { ...state, inviteOpen: false },
        {
          ...state.project,
          people: [...state.project.people, ...additions],
          chats: state.project.chats.map((chat) => {
            if (chat.id !== action.chatId) return chat
            const ids = action.ids.filter((id) => !chat.participantIds.includes(id))
            return {
              ...chat,
              participantIds: [...chat.participantIds, ...ids],
              messages: [
                ...chat.messages,
                ...ids.map((id) => ({
                  id: uid('m'),
                  authorId: 'system',
                  text: joinNotice(findPerson(id, state.project!.kind, state.project!.people)?.name ?? additions.find((p) => p.id === id)?.name ?? id),
                  createdAt: new Date().toISOString(),
                })),
              ],
            }
          }),
        },
      )
    }
    case 'group': {
      if (!state.project) return state
      const chat = {
        id: action.id,
        kind: 'group' as const,
        title: action.title,
        participantIds: action.participantIds,
        messages: [
          {
            id: uid('m'),
            authorId: 'system',
            text: `Gruppsamtalet ${action.title} är skapat.`,
            createdAt: new Date().toISOString(),
          },
        ],
      }
      return mapProject(
        { ...state, activeChatId: chat.id, section: 'chat', groupOpen: false },
        { ...state.project, chats: [...state.project.chats, chat] },
      )
    }
    case 'dm': {
      if (!state.project) return state
      const existing = state.project.chats.find(
        (chat) => chat.kind === 'dm' && chat.participantIds.length === 2 && chat.participantIds.includes('fredrik') && chat.participantIds.includes(action.personId),
      )
      if (existing) {
        return { ...state, activeChatId: existing.id, section: 'chat', focusPersonId: action.personId, rightMode: 'agent', rightOpen: true }
      }
      const person = findPerson(action.personId, state.project.kind, state.project.people)
      const chat = {
        id: action.chatId,
        kind: 'dm' as const,
        title: person?.name ?? 'Direktmeddelande',
        participantIds: ['fredrik', action.personId],
        messages: [] as Project['chats'][number]['messages'],
      }
      return mapProject(
        { ...state, activeChatId: chat.id, section: 'chat', focusPersonId: action.personId, rightMode: 'agent', rightOpen: true },
        { ...state.project, chats: [...state.project.chats, chat] },
      )
    }
    case 'add-person-chat': {
      if (!state.project || !state.activeChatId) return { ...state, extras: [...state.extras, action.person] }
      const person = action.person
      return mapProject(
        { ...state, addPersonOpen: false },
        {
          ...state.project,
          people: [...state.project.people, person],
          chats: state.project.chats.map((chat) =>
            chat.id === state.activeChatId
              ? {
                  ...chat,
                  participantIds: [...chat.participantIds, person.id],
                  messages: [
                    ...chat.messages,
                    {
                      id: uid('m'),
                      authorId: 'system',
                      text: `${person.name} lades till i projektet och samtalet.`,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : chat,
          ),
        },
      )
    }
    case 'right':
      return { ...state, rightOpen: action.open }
    case 'mode':
      return { ...state, rightMode: action.mode, rightOpen: true }
    case 'focus':
      return { ...state, focusPersonId: action.id, rightMode: 'agent', rightOpen: true }
    case 'huddle':
      return { ...state, huddle: action.huddle }
    case 'mute':
      return { ...state, huddle: state.huddle ? { ...state.huddle, muted: !state.huddle.muted } : null }
    case 'huddle-add':
      if (!state.huddle || state.huddle.participantIds.includes(action.id)) return state
      return { ...state, huddle: { ...state.huddle, participantIds: [...state.huddle.participantIds, action.id] } }
    case 'activity-draft':
      return { ...state, activityDraft: action.draft }
    case 'patch-activity':
      return { ...state, activityDraft: state.activityDraft ? { ...state.activityDraft, ...action.patch } : null }
    case 'commit-activity': {
      if (!state.project || !state.activityDraft || !state.activityDraft.title.trim()) return state
      const draft = state.activityDraft
      const owner = findPerson(draft.ownerId, state.project.kind, state.project.people)
      const activity: Activity = {
        id: action.id,
        key: `custom-${action.id}`,
        title: draft.title.trim(),
        description: draft.description.trim() || draft.title.trim(),
        ownerId: draft.ownerId,
        contributorIds: [],
        status: 'todo',
        dependsOn: [],
        blockers: [],
        agentCanStart: owner?.kind === 'agent',
        needsHuman: owner?.kind === 'human' ? 'Ägaren är en människa. Det här behöver en person, inte en agent.' : undefined,
        chatId: draft.chatId,
        messageId: draft.messageId,
      }
      return mapProject(
        { ...state, activityDraft: null, highlightActivityId: activity.id },
        {
          ...state.project,
          activities: [...state.project.activities, activity],
          chats: state.project.chats.map((chat) =>
            chat.id === draft.chatId
              ? { ...chat, messages: chat.messages.map((m) => (m.id === draft.messageId ? { ...m, activityId: activity.id } : m)) }
              : chat,
          ),
        },
      )
    }
    case 'decision-draft':
      return { ...state, decisionDraft: action.draft }
    case 'patch-decision':
      return { ...state, decisionDraft: state.decisionDraft ? { ...state.decisionDraft, content: action.content } : null }
    case 'commit-decision': {
      if (!state.project || !state.decisionDraft || !state.decisionDraft.content.trim()) return state
      const draft = state.decisionDraft
      const decision: Decision = {
        id: action.id,
        content: draft.content.trim(),
        createdAt: new Date().toISOString(),
        chatId: draft.chatId,
        messageId: draft.messageId,
      }
      return mapProject(
        { ...state, decisionDraft: null },
        {
          ...state.project,
          decisions: [...state.project.decisions, decision],
          chats: state.project.chats.map((chat) =>
            chat.id === draft.chatId
              ? { ...chat, messages: chat.messages.map((m) => (m.id === draft.messageId ? { ...m, decisionId: decision.id } : m)) }
              : chat,
          ),
        },
      )
    }
    case 'status':
      if (!state.project) return state
      return mapProject(state, { ...state.project, activities: withStatus(state.project.activities, action.id, action.status) })
    case 'show-activity':
      return { ...state, section: 'activities', highlightActivityId: action.id, openActivityId: action.id }
    case 'open-activity':
      return { ...state, openActivityId: action.id, section: action.id ? 'activities' : state.section }
    case 'focus-message':
      return { ...state, section: 'chat', activeChatId: action.chatId, focusMessageId: action.messageId }
    case 'search':
      return { ...state, search: action.query }
    case 'listen':
      return { ...state, listening: action.value }
    case 'listen-done':
      return { ...state, listening: false, composer: state.composer.trim() ? state.composer : 'Vad behöver vi göra härnäst?' }
    case 'boards':
      return { ...state, activityView: action.view, section: 'activities' }
    case 'close-overlays':
      return { ...state, inviteOpen: false, groupOpen: false, addPersonOpen: false, activityDraft: null, decisionDraft: null, openActivityId: null }
    case 'overlay': {
      const next: State = { ...state, inviteOpen: false, groupOpen: false, addPersonOpen: false }
      next[action.key] = action.open
      return next
    }
    default:
      return state
  }
}

interface Api {
  state: State
  sendStart: (text: string) => void
  sendBrief: (text: string) => void
  editName: (name: string) => void
  editItemText: (id: string, text: string) => void
  confirmFact: (id: string) => void
  removeFact: (id: string) => void
  approveBrief: () => void
  backToBrief: () => void
  toggleMember: (id: string) => void
  addPerson: (input: { name: string; email: string; role: string }) => void
  removeExtra: (id: string) => void
  openWorkspace: () => void
  goSection: (section: AppSection) => void
  goStart: () => void
  backToProject: () => void
  setChat: (id: string) => void
  setComposer: (text: string) => void
  sendComposer: () => void
  attachSample: () => void
  pulseMic: () => void
  setInviteOpen: (open: boolean) => void
  invite: (ids: string[]) => void
  setGroupOpen: (open: boolean) => void
  createGroup: (title: string, ids: string[]) => void
  openDm: (personId: string) => void
  setRightOpen: (open: boolean) => void
  setRightMode: (mode: RightMode) => void
  focusPerson: (id: string | null) => void
  startHuddle: (ids: string[]) => void
  endHuddle: () => void
  toggleMute: () => void
  addToHuddle: (id: string) => void
  beginActivity: (chatId: string, messageId: string) => void
  patchActivityDraft: (patch: Partial<ActivityDraft>) => void
  cancelActivityDraft: () => void
  commitActivity: () => void
  beginDecision: (chatId: string, messageId: string) => void
  patchDecisionDraft: (content: string) => void
  cancelDecision: () => void
  commitDecision: () => void
  setActivityStatus: (id: string, status: Status) => void
  openActivityByKey: (key: string) => void
  openActivity: (id: string | null) => void
  gotoMessage: (chatId: string, messageId: string) => void
  setSearch: (query: string) => void
  setActivityView: (view: State['activityView']) => void
  closeOverlays: () => void
  setAddPersonOpen: (open: boolean) => void
}

const Ctx = createContext<Api | null>(null)

const later = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, initial)
  const stateRef = useRef(state)
  stateRef.current = state
  const tokens = useRef<Record<string, number>>({})
  const briefToken = useRef(0)
  const briefLock = useRef(false)
  const sending = useRef(false)

  async function play(chatId: string, steps: Outgoing[]) {
    if (!steps.length) return
    const token = (tokens.current[chatId] ?? 0) + 1
    tokens.current[chatId] = token
    for (const step of steps) {
      if (tokens.current[chatId] !== token) return
      dispatch({ type: 'typing', typing: { chatId, personId: step.authorId } })
      await later(620)
      if (tokens.current[chatId] !== token) return
      dispatch({ type: 'incoming', chatId, step })
    }
    if (tokens.current[chatId] === token) dispatch({ type: 'typing', typing: null })
  }

  const api: Api = {
    state,
    sendStart: (text) => {
      const trimmed = text.trim()
      if (!trimmed || briefLock.current) return
      briefLock.current = true
      const created = createBrief(trimmed)
      const token = ++briefToken.current
      dispatch({ type: 'started', brief: created.brief })
      void later(620).then(() => {
        briefLock.current = false
        if (briefToken.current !== token) return
        dispatch({ type: 'brief-reply', text: created.reply.text, chips: created.reply.chips })
      })
    },
    sendBrief: (text) => {
      const current = stateRef.current
      if (!current.brief || current.briefTyping || briefLock.current || !text.trim()) return
      briefLock.current = true
      const result = applyUserTurn(current.brief, text)
      const token = ++briefToken.current
      dispatch({ type: 'brief-user', brief: result.brief })
      void later(620).then(() => {
        briefLock.current = false
        if (briefToken.current !== token) return
        dispatch({ type: 'brief-reply', text: result.reply.text, chips: result.reply.chips })
      })
    },
    editName: (name) => dispatch({ type: 'rename', name }),
    editItemText: (id, text) => dispatch({ type: 'edit-item', id, text }),
    confirmFact: (id) => dispatch({ type: 'confirm-item', id }),
    removeFact: (id) => dispatch({ type: 'remove-item', id }),
    approveBrief: () => dispatch({ type: 'approve' }),
    backToBrief: () => dispatch({ type: 'back-brief' }),
    toggleMember: (id) => dispatch({ type: 'toggle-member', id }),
    addPerson: ({ name, email, role }) => {
      const trimmed = name.trim()
      if (!trimmed) return
      const person: Person = {
        id: uid('human'),
        name: trimmed,
        email: email.trim() || undefined,
        kind: 'human',
        role: role.trim() || 'Deltagare',
        skills: [],
        why: '',
        examples: [],
        look: 'human',
      }
      const current = stateRef.current
      if (current.phase === 'app' && current.project && current.activeChatId) {
        dispatch({ type: 'add-person-chat', person })
        void play(current.activeChatId, [{ authorId: person.id, text: humanJoinLine(person.name) }])
        return
      }
      dispatch({ type: 'add-extra', person })
    },
    removeExtra: (id) => dispatch({ type: 'remove-extra', id }),
    openWorkspace: () => dispatch({ type: 'open-app' }),
    goSection: (section) => dispatch({ type: 'section', section }),
    goStart: () => dispatch({ type: 'phase', phase: 'start' }),
    backToProject: () => dispatch({ type: 'phase', phase: 'app' }),
    setChat: (id) => dispatch({ type: 'chat', id }),
    setComposer: (text) => dispatch({ type: 'composer', text }),
    sendComposer: () => {
      const current = stateRef.current
      const text = current.composer.trim()
      if (!text || !current.project || !current.activeChatId || sending.current) return
      if (current.typing?.chatId === current.activeChatId) return
      const chat = current.project.chats.find((entry) => entry.id === current.activeChatId)
      if (!chat) return
      sending.current = true
      dispatch({ type: 'outgoing', chatId: chat.id, text })
      void play(chat.id, planReplies(text, chat, current.project)).finally(() => {
        sending.current = false
      })
    },
    attachSample: () => {
      const current = stateRef.current
      if (!current.project || !current.activeChatId || current.typing?.chatId === current.activeChatId) return
      const chat = current.project.chats.find((entry) => entry.id === current.activeChatId)
      if (!chat) return
      dispatch({ type: 'attach', chatId: chat.id })
      void play(chat.id, attachmentReplies(chat, current.project))
    },
    pulseMic: () => {
      if (stateRef.current.listening) return
      dispatch({ type: 'listen', value: true })
      void later(900).then(() => dispatch({ type: 'listen-done' }))
    },
    setInviteOpen: (open) => dispatch({ type: 'overlay', key: 'inviteOpen', open }),
    invite: (ids) => {
      const current = stateRef.current
      if (!current.project || !current.activeChatId || !ids.length) return
      const chat = current.project.chats.find((entry) => entry.id === current.activeChatId)
      if (!chat) return
      const fresh = ids.filter((id) => !chat.participantIds.includes(id))
      if (!fresh.length) {
        dispatch({ type: 'close-overlays' })
        return
      }
      dispatch({ type: 'invite', chatId: chat.id, ids: fresh })
      void play(
        chat.id,
        fresh.map((id) => ({ authorId: id, text: joinFollowup(id, current.project!, chat) })),
      )
    },
    setGroupOpen: (open) => dispatch({ type: 'overlay', key: 'groupOpen', open }),
    createGroup: (title, ids) => {
      const participantIds = ['fredrik', ...ids.filter((id) => id !== 'fredrik')]
      if (participantIds.length < 2) return
      dispatch({ type: 'group', id: uid('chat'), title: title.trim() || 'Gruppsamtal', participantIds })
    },
    openDm: (personId) => dispatch({ type: 'dm', personId, chatId: uid('chat') }),
    setRightOpen: (open) => dispatch({ type: 'right', open }),
    setRightMode: (mode) => dispatch({ type: 'mode', mode }),
    focusPerson: (id) => dispatch({ type: 'focus', id }),
    startHuddle: (ids) =>
      dispatch({
        type: 'huddle',
        huddle: { participantIds: ids.length ? ids : ['fredrik'], muted: false, startedAt: Date.now() },
      }),
    endHuddle: () => dispatch({ type: 'huddle', huddle: null }),
    toggleMute: () => dispatch({ type: 'mute' }),
    addToHuddle: (id) => dispatch({ type: 'huddle-add', id }),
    beginActivity: (chatId, messageId) => {
      const current = stateRef.current
      const message = current.project?.chats.find((chat) => chat.id === chatId)?.messages.find((m) => m.id === messageId)
      if (!message) return
      dispatch({ type: 'activity-draft', draft: suggestActivity(message, chatId) })
    },
    patchActivityDraft: (patch) => dispatch({ type: 'patch-activity', patch }),
    cancelActivityDraft: () => dispatch({ type: 'activity-draft', draft: null }),
    commitActivity: () => dispatch({ type: 'commit-activity', id: uid('act') }),
    beginDecision: (chatId, messageId) => {
      const message = stateRef.current.project?.chats.find((chat) => chat.id === chatId)?.messages.find((m) => m.id === messageId)
      if (!message) return
      dispatch({ type: 'decision-draft', draft: { chatId, messageId, content: message.text } })
    },
    patchDecisionDraft: (content) => dispatch({ type: 'patch-decision', content }),
    cancelDecision: () => dispatch({ type: 'decision-draft', draft: null }),
    commitDecision: () => dispatch({ type: 'commit-decision', id: uid('dec') }),
    setActivityStatus: (id, status) => dispatch({ type: 'status', id, status }),
    openActivityByKey: (key) => {
      const activity = stateRef.current.project?.activities.find((entry) => entry.key === key)
      if (activity) dispatch({ type: 'show-activity', id: activity.id })
    },
    openActivity: (id) => dispatch({ type: 'open-activity', id }),
    gotoMessage: (chatId, messageId) => dispatch({ type: 'focus-message', chatId, messageId }),
    setSearch: (query) => dispatch({ type: 'search', query }),
    setActivityView: (view) => dispatch({ type: 'boards', view }),
    closeOverlays: () => dispatch({ type: 'close-overlays' }),
    setAddPersonOpen: (open) => dispatch({ type: 'overlay', key: 'addPersonOpen', open }),
  }

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useApp(): Api {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp utan provider')
  return ctx
}
