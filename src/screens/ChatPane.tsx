import { useEffect, useMemo, useRef, useState } from 'react'
import { agentsFor, findPerson, SAMPLE_FILE } from '../content'
import { formatStamp, statusLabel } from '../format'
import { useApp } from '../store'
import { AiBadge, IconAttach, IconMic, IconSend, Portrait } from '../ui'

export function ChatPane() {
  const app = useApp()
  const { state } = app
  const project = state.project
  const chat = project?.chats.find((entry) => entry.id === state.activeChatId)
  const endRef = useRef<HTMLDivElement>(null)
  const [attachOpen, setAttachOpen] = useState(false)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [chat?.messages.length, state.typing])

  useEffect(() => {
    if (!state.focusMessageId) return
    document.getElementById(`msg-${state.focusMessageId}`)?.scrollIntoView({ block: 'center' })
  }, [state.focusMessageId])

  const mention = useMemo(() => {
    if (!project) return null
    const match = state.composer.match(/@([\p{L}]*)$/u)
    if (!match) return null
    const q = match[1].toLowerCase()
    const people = [...project.people, ...agentsFor(project.kind)].filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i)
    return people.filter((p) => p.name.toLowerCase().includes(q) || p.name.split(' ')[0].toLowerCase().startsWith(q)).slice(0, 6)
  }, [project, state.composer])

  if (!project || !chat) return null
  const typingHere = state.typing?.chatId === chat.id ? findPerson(state.typing.personId, project.kind, project.people) : undefined

  function insertMention(name: string) {
    app.setComposer(state.composer.replace(/@([\p{L}]*)$/u, `@${name} `))
  }

  function send() {
    app.sendComposer()
    setAttachOpen(false)
  }

  return (
    <div className="chat-pane">
      <div className="chat-tabs">
        {project.chats.map((entry) => (
          <button key={entry.id} type="button" className={entry.id === chat.id ? 'is-active' : ''} onClick={() => app.setChat(entry.id)}>
            {entry.title}
          </button>
        ))}
        <button type="button" data-testid="new-group" onClick={() => app.setGroupOpen(true)}>
          + Grupp
        </button>
      </div>
      <div className="presence-row">
        {chat.participantIds.map((id) => {
          const person = findPerson(id, project.kind, project.people)
          if (!person) return null
          return (
            <button key={id} type="button" onClick={() => app.focusPerson(person.id)}>
              <Portrait look={person.look} name={person.name} size={22} />
              <span>{person.name}</span>
              {person.kind === 'agent' && <AiBadge />}
            </button>
          )
        })}
        <button type="button" className="invite-inline" data-testid="invite-specialist" onClick={() => app.setInviteOpen(true)}>
          Bjud in specialist
        </button>
      </div>
      <div className="transcript" aria-live="polite">
        {chat.messages.length === 0 && <p className="empty center">Skriv till {chat.title}.</p>}
        {chat.messages.map((message) => {
          if (message.authorId === 'system') {
            return (
              <p key={message.id} className="system" id={`msg-${message.id}`}>
                {message.text}
              </p>
            )
          }
          const author = findPerson(message.authorId, project.kind, project.people)
          const mine = message.authorId === 'fredrik'
          const activity = message.activityId ? project.activities.find((a) => a.id === message.activityId) : undefined
          const decision = message.decisionId ? project.decisions.find((d) => d.id === message.decisionId) : undefined
          const lines = message.text.split('\n')
          let linkIndex = 0
          return (
            <div key={message.id} id={`msg-${message.id}`} className={mine ? 'row row--me' : 'row row--agent'}>
              {!mine && author && <Portrait look={author.look} name={author.name} size={32} />}
              <div className="msg-stack">
                {!mine && author && (
                  <div className="who-line">
                    <strong>{author.name}</strong>
                    {author.kind === 'agent' && <AiBadge />}
                    <time>{formatStamp(message.createdAt)}</time>
                  </div>
                )}
                {mine && (
                  <div className="who-line who-line--me">
                    <time>{formatStamp(message.createdAt)}</time>
                  </div>
                )}
                <div className={mine ? 'bubble bubble--me' : 'bubble'}>
                  {message.proposal && !decision && <span className="tag tag--proposal">Förslag</span>}
                  {lines.map((line, i) => {
                    const numbered = line.match(/^(\d+)\.\s+(.*)/)
                    const link = numbered ? message.links?.[linkIndex] : undefined
                    if (numbered && link) {
                      linkIndex += 1
                      return (
                        <button key={i} type="button" className="msg-link" onClick={() => app.openActivityByKey(link.activityKey)}>
                          {numbered[1]}. {numbered[2]}
                        </button>
                      )
                    }
                    return <p key={i}>{line || '\u00a0'}</p>
                  })}
                  {message.attachmentName && <span className="file-chip">{message.attachmentName}</span>}
                </div>
                <div className="msg-actions">
                  {!activity && (
                    <button type="button" onClick={() => app.beginActivity(chat.id, message.id)}>
                      Skapa aktivitet
                    </button>
                  )}
                  {!decision && (
                    <button type="button" onClick={() => app.beginDecision(chat.id, message.id)}>
                      Spara som beslut
                    </button>
                  )}
                  {message.inviteHint && (
                    <button type="button" onClick={() => app.setInviteOpen(true)}>
                      Bjud in specialist
                    </button>
                  )}
                </div>
                {decision && (
                  <article className="result-card result-card--decision">
                    <span>Beslut · {formatStamp(decision.createdAt).replace(/ \d{2}:\d{2}$/, '')}</span>
                    <p>{decision.content}</p>
                  </article>
                )}
                {activity && (
                  <button type="button" className="result-card result-card--activity" onClick={() => app.openActivity(activity.id)}>
                    <span>Aktivitet · {statusLabel(activity.status)}</span>
                    <strong>{activity.title}</strong>
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {typingHere && (
          <div className="row row--agent" data-testid="typing">
            <Portrait look={typingHere.look} name={typingHere.name} size={32} />
            <div className="bubble typing">{typingHere.name.split(' ')[0]} skriver…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        {mention && mention.length > 0 && (
          <div className="mention-menu" role="listbox">
            {mention.map((person) => (
              <button key={person.id} type="button" onClick={() => insertMention(person.name)}>
                {person.name}
                <span>{person.role}</span>
              </button>
            ))}
          </div>
        )}
        {attachOpen && (
          <div className="attach-menu">
            <button
              type="button"
              onClick={() => {
                setAttachOpen(false)
                app.attachSample()
              }}
            >
              {SAMPLE_FILE}
              <span>Exempelutdrag</span>
            </button>
          </div>
        )}
        <button type="button" className="icon-btn" aria-label="Bifoga" data-testid="attach" onClick={() => setAttachOpen((v) => !v)}>
          <IconAttach />
        </button>
        <textarea
          data-testid="composer"
          value={state.composer}
          placeholder="Skriv till teamet. Använd @ för att nämna någon."
          rows={2}
          onChange={(e) => app.setComposer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button
          type="button"
          className={state.listening ? 'icon-btn is-on' : 'icon-btn'}
          aria-label="Spela in röstmeddelande"
          aria-pressed={state.listening}
          data-testid="mic"
          onClick={app.pulseMic}
        >
          <IconMic />
        </button>
        <button className="send" type="submit" aria-label="Skicka" data-testid="send" disabled={!state.composer.trim() || state.typing?.chatId === chat.id}>
          <IconSend />
        </button>
      </form>
      {state.listening && <p className="listen-note">Lyssnar…</p>}
    </div>
  )
}
