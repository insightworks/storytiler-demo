import { useEffect, useState } from 'react'
import { agentsFor, documentCount, findPerson, myTasks, nowLine, searchHits } from '../content'
import { formatShort, statusLabel, cn } from '../format'
import { useApp } from '../store'
import type { Person } from '../types'
import { AiBadge, IconSearch, Portrait } from '../ui'
import { ChatPane } from './ChatPane'
import { ActivitiesPane, ActivityDetail, BriefPane, OverviewPane, SettingsPane, TasksPane, TeamPane } from './Panes'

export function Workspace() {
  const app = useApp()
  const { state } = app
  const project = state.project
  const [menu, setMenu] = useState(false)
  const [huddleAdd, setHuddleAdd] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        app.closeOverlays()
        app.setSearch('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [app])

  if (!project) return null
  const hits = searchHits(project, state.search)
  const openSteps = project.activities.filter((a) => a.status !== 'done').slice(0, 4)
  const lead = project.people.find((p) => p.lead) ?? findPerson('nora', project.kind, project.people)
  const focus = (state.focusPersonId ? findPerson(state.focusPersonId, project.kind, project.people) : null) ?? lead
  const chat = project.chats.find((c) => c.id === state.activeChatId) ?? project.chats[0]

  return (
    <div className="app-shell" data-testid="workspace">
      <aside className="rail">
        <div className="brand">
          <strong>storytiler<span className="brand-dot">.</span></strong>
        </div>
        <div className="search-wrap">
          <IconSearch />
          <input
            data-testid="search"
            placeholder="Sök projekt, personer och innehåll"
            value={state.search}
            onChange={(e) => app.setSearch(e.target.value)}
            aria-label="Sök projekt, personer och innehåll"
          />
          {hits.length > 0 && (
            <div className="search-pop">
              {hits.map((hit, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    app.setSearch('')
                    if (hit.type === 'project') app.goSection('chat')
                    if (hit.type === 'person') app.focusPerson(hit.id)
                    if (hit.type === 'activity') app.openActivity(hit.id)
                    if (hit.type === 'message') app.gotoMessage(hit.chatId, hit.messageId)
                  }}
                >
                  <strong>{hit.label}</strong>
                  {'meta' in hit && <span>{hit.meta}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <nav>
          <button type="button" className={state.section === 'overview' ? 'nav-item is-active' : 'nav-item'} onClick={() => app.goSection('overview')}>
            Översikt
          </button>
          <button type="button" className={state.section === 'tasks' ? 'nav-item is-active' : 'nav-item'} onClick={() => app.goSection('tasks')}>
            Mina uppgifter
            <span className="count">{myTasks(project).length}</span>
          </button>
          <div className="nav-label">
            Projekt
            <button type="button" aria-label="Nytt projekt" data-testid="new-project" onClick={app.goStart}>
              +
            </button>
          </div>
          <button
            type="button"
            className={['chat', 'activities', 'team', 'brief'].includes(state.section) ? 'project-row is-active' : 'project-row'}
            onClick={() => app.goSection('chat')}
          >
            {project.name}
          </button>
          <div className="subnav">
            <button type="button" className={state.section === 'chat' ? 'is-active' : ''} onClick={() => app.goSection('chat')}>
              Projektchatt
            </button>
            <button type="button" className={state.section === 'activities' ? 'is-active' : ''} onClick={() => app.goSection('activities')}>
              Aktiviteter
            </button>
            <button type="button" className={state.section === 'team' ? 'is-active' : ''} onClick={() => app.goSection('team')}>
              Team
            </button>
            <button type="button" className={state.section === 'brief' ? 'is-active' : ''} onClick={() => app.goSection('brief')}>
              Projektbrief
            </button>
          </div>
        </nav>
        <div className="rail-spacer" />
        <button type="button" className={state.section === 'settings' ? 'nav-item is-active' : 'nav-item'} onClick={() => app.goSection('settings')}>
          Inställningar
        </button>
        <div className="me">
          <Portrait look="fredrik" name="Fredrik" size={36} />
          <div>
            <strong>Fredrik</strong>
            <span>fredrik@studionord.se</span>
          </div>
        </div>
      </aside>

      <div className={cn('workspace', !state.rightOpen && 'is-collapsed')}>
        <section className="center-card">
          <header className="center-head">
            <div>
              <p className="crumbs">Projekt / {project.name}</p>
              <h1>{project.name}</h1>
            </div>
            <div className="head-actions">
              <div className="avatar-stack">
                {project.people.slice(0, 5).map((person) => (
                  <button key={person.id} type="button" onClick={() => app.focusPerson(person.id)} aria-label={person.name}>
                    <Portrait look={person.look} name={person.name} size={32} />
                  </button>
                ))}
              </div>
              <div className="menu-wrap">
                <button type="button" className="ghost" data-testid="invite-menu" onClick={() => setMenu((v) => !v)}>
                  Bjud in
                </button>
                {menu && (
                  <div className="menu">
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false)
                        app.setInviteOpen(true)
                      }}
                    >
                      Bjud in specialist
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false)
                        app.setAddPersonOpen(true)
                      }}
                    >
                      Lägg till person
                    </button>
                  </div>
                )}
              </div>
              {!state.rightOpen && (
                <button type="button" className="ghost" onClick={() => app.setRightOpen(true)}>
                  Visa agent
                </button>
              )}
            </div>
          </header>

          {state.section === 'chat' && (
            <section className="next">
              <header>
                <h2>Nästa steg</h2>
                <button type="button" onClick={() => app.goSection('activities')}>
                  Alla {project.activities.length} items
                </button>
              </header>
              {openSteps.map((activity) => {
                const owner = findPerson(activity.ownerId, project.kind, project.people)
                return (
                  <div key={activity.id} className="next-row">
                    <input
                      type="checkbox"
                      aria-label={`Markera ${activity.title} klar`}
                      onChange={() => app.setActivityStatus(activity.id, 'done')}
                    />
                    <button type="button" className="next-title" onClick={() => app.openActivity(activity.id)}>
                      {activity.title}
                    </button>
                    {owner && (
                      <span className="who">
                        <Portrait look={owner.look} name={owner.name} size={20} />
                        {owner.name.split(' ')[0]}
                      </span>
                    )}
                    {activity.status === 'waiting' ? (
                      <span className="pill is-wait">Väntar på input</span>
                    ) : activity.deadline ? (
                      <span className="when">{formatShort(activity.deadline)}</span>
                    ) : (
                      <span className="pill">{statusLabel(activity.status)}</span>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          <div className={cn('center-body', state.section === 'chat' && 'is-chat')}>
            {state.section === 'chat' && <ChatPane />}
            {state.section === 'overview' && <OverviewPane />}
            {state.section === 'tasks' && <TasksPane />}
            {state.section === 'activities' && <ActivitiesPane />}
            {state.section === 'team' && <TeamPane />}
            {state.section === 'brief' && <BriefPane />}
            {state.section === 'settings' && <SettingsPane />}
          </div>
        </section>

        {state.rightOpen && focus && (
          <AgentCard
            person={focus}
            leadId={lead?.id ?? 'nora'}
            onCollapse={() => app.setRightOpen(false)}
            onCall={() => {
              setHuddleAdd(false)
              app.startHuddle(['fredrik', focus.id])
            }}
            onInviteCall={() => {
              setHuddleAdd(true)
              app.startHuddle(['fredrik', focus.id])
            }}
          />
        )}
      </div>

      {state.huddle && (
        <HuddlePanel
          showAdd={huddleAdd}
          onToggleAdd={() => setHuddleAdd((v) => !v)}
        />
      )}
      {state.inviteOpen && <InviteModal />}
      {state.groupOpen && <GroupModal />}
      {state.addPersonOpen && <PersonModal />}
      {state.activityDraft && <ActivityModal />}
      {state.decisionDraft && <DecisionModal />}
      {state.openActivityId && <ActivityDetail />}
      <span className="sr-only">{chat?.title}</span>
    </div>
  )
}

function AgentCard({
  person,
  leadId,
  onCollapse,
  onCall,
  onInviteCall,
}: {
  person: Person
  leadId: string
  onCollapse: () => void
  onCall: () => void
  onInviteCall: () => void
}) {
  const app = useApp()
  const project = app.state.project!
  const chat = project.chats.find((c) => c.id === app.state.activeChatId)
  const mode = app.state.rightMode
  return (
    <aside className="agent-card" data-testid="agent-card">
      <div className="card-tools">
        <div className="seg">
          <button type="button" className={mode === 'agent' ? 'is-on' : ''} onClick={() => app.setRightMode('agent')}>
            Agent
          </button>
          <button type="button" className={mode === 'chat' ? 'is-on' : ''} onClick={() => app.setRightMode('chat')}>
            Samtal
          </button>
        </div>
        <button type="button" aria-label="Dölj panel" data-testid="collapse-panel" onClick={onCollapse}>
          ›
        </button>
      </div>
      {mode === 'chat' && chat ? (
        <div className="chat-side">
          <p className="eyebrow">Det här samtalet</p>
          <h2>{chat.title}</h2>
          <ul className="side-people">
            {chat.participantIds.map((id) => {
              const member = findPerson(id, project.kind, project.people)
              if (!member) return null
              return (
                <li key={id}>
                  <Portrait look={member.look} name={member.name} size={28} />
                  {member.name}
                  {member.kind === 'agent' && <AiBadge />}
                </li>
              )
            })}
          </ul>
          <p className="eyebrow">Just nu</p>
          <p>{chat.messages.filter((m) => m.authorId !== 'system').slice(-1)[0]?.text.slice(0, 140) ?? 'Inget nytt.'}</p>
          <p className="muted">Uppdaterat nyss</p>
          <button type="button" className="call" onClick={onCall}>
            Ring
          </button>
          <button type="button" className="textish" onClick={() => app.setInviteOpen(true)}>
            Bjud in specialist
          </button>
        </div>
      ) : (
        <div className="agent-side">
          <p className="eyebrow">Din projektagent</p>
          <div className="portrait-frame">
            <Portrait look={person.look} name={person.name} size={132} />
          </div>
          <h2>
            {person.name} {person.kind === 'agent' && <AiBadge />}
          </h2>
          <p className="ok">
            <i /> Tillgänglig
          </p>
          <p className="role-line">
            {person.role} · {project.name}
          </p>
          {person.skills.length > 0 && (
            <ul className="skills">
              {person.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          )}
          <button type="button" className="call" data-testid="call" onClick={onCall}>
            Ring {person.name.split(' ')[0]}
          </button>
          <button type="button" className="textish" data-testid="invite-call" onClick={onInviteCall}>
            Bjud in till samtal
          </button>
          {person.id !== leadId && (
            <button type="button" className="text-btn" onClick={() => app.focusPerson(null)}>
              Visa projektagenten
            </button>
          )}
          <p className="eyebrow">Just nu</p>
          <p>{nowLine(person.id, project)}</p>
          <p className="muted">Uppdaterat nyss</p>
          <button type="button" className="doc-row" onClick={() => app.goSection('brief')}>
            <span>Projektbrief</span>
            <span>{documentCount(project)} dokument</span>
          </button>
        </div>
      )}
    </aside>
  )
}

function HuddlePanel({ showAdd, onToggleAdd }: { showAdd: boolean; onToggleAdd: () => void }) {
  const app = useApp()
  const project = app.state.project!
  const huddle = app.state.huddle!
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const elapsed = Math.max(0, Math.floor((now - huddle.startedAt) / 1000))
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')
  const others = project.people.filter((p) => !huddle.participantIds.includes(p.id))
  return (
    <section className="huddle" data-testid="huddle">
      <header>
        <strong>Samtal</strong>
        <span>{project.name}</span>
      </header>
      <div className="huddle-people">
        {huddle.participantIds.map((id) => {
          const person = findPerson(id, project.kind, project.people)
          if (!person) return null
          return (
            <div key={id}>
              <Portrait look={person.look} name={person.name} size={42} />
              <span>{person.name.split(' ')[0]}</span>
            </div>
          )
        })}
      </div>
      <p className="timer">{mm}:{ss}</p>
      <p className="muted">Simulerat samtal. Ingen ljuduppkoppling.</p>
      {showAdd && (
        <div className="huddle-add">
          {others.map((person) => (
            <button key={person.id} type="button" onClick={() => app.addToHuddle(person.id)}>
              {person.name}
            </button>
          ))}
          {others.length === 0 && <p>Alla i projektet är med.</p>}
        </div>
      )}
      <div className="huddle-actions">
        <button type="button" onClick={onToggleAdd}>
          Bjud in
        </button>
        <button type="button" onClick={app.toggleMute} aria-pressed={huddle.muted}>
          {huddle.muted ? 'Ljud av' : 'Mikrofon'}
        </button>
        <button type="button" className="leave" onClick={app.endHuddle}>
          Lämna
        </button>
      </div>
    </section>
  )
}

function InviteModal() {
  const app = useApp()
  const project = app.state.project!
  const chat = project.chats.find((c) => c.id === app.state.activeChatId)
  const options = agentsFor(project.kind).filter((p) => !chat?.participantIds.includes(p.id))
  const [ids, setIds] = useState<string[]>([])
  return (
    <div className="modal-back" onMouseDown={() => app.setInviteOpen(false)}>
      <form
        className="modal"
        data-testid="invite-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          app.invite(ids)
        }}
      >
        <h2>Bjud in specialist</h2>
        <p>De får projektbriefen, sparade beslut och relevant kontext från konversationen.</p>
        {options.length === 0 && <p className="empty">Alla specialister är redan med i samtalet.</p>}
        <ul className="picker">
          {options.map((person) => (
            <li key={person.id}>
              <label>
                <input
                  type="checkbox"
                  checked={ids.includes(person.id)}
                  onChange={() => setIds((curr) => (curr.includes(person.id) ? curr.filter((id) => id !== person.id) : [...curr, person.id]))}
                />
                <Portrait look={person.look} name={person.name} size={36} />
                <span>
                  <strong>
                    {person.name} <AiBadge />
                  </strong>
                  <em>{person.role}</em>
                  <small>{person.skills.join(', ')}</small>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => app.setInviteOpen(false)}>
            Avbryt
          </button>
          <button type="submit" className="approve small" data-testid="confirm-invite" disabled={!ids.length}>
            Bjud in
          </button>
        </div>
      </form>
    </div>
  )
}

function GroupModal() {
  const app = useApp()
  const project = app.state.project!
  const [title, setTitle] = useState('Gruppsamtal')
  const [ids, setIds] = useState<string[]>([])
  const people = project.people.filter((p) => p.id !== 'fredrik')
  return (
    <div className="modal-back" onMouseDown={() => app.setGroupOpen(false)}>
      <form
        className="modal"
        data-testid="group-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          app.createGroup(title, ids)
        }}
      >
        <h2>Nytt gruppsamtal</h2>
        <label>
          Namn
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <ul className="picker">
          {people.map((person) => (
            <li key={person.id}>
              <label>
                <input
                  type="checkbox"
                  checked={ids.includes(person.id)}
                  onChange={() => setIds((curr) => (curr.includes(person.id) ? curr.filter((id) => id !== person.id) : [...curr, person.id]))}
                />
                {person.name}
                {person.kind === 'agent' && <AiBadge />}
                <small>{person.role}</small>
              </label>
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => app.setGroupOpen(false)}>
            Avbryt
          </button>
          <button type="submit" className="approve small" data-testid="confirm-group" disabled={!ids.length}>
            Skapa
          </button>
        </div>
      </form>
    </div>
  )
}

function PersonModal() {
  const app = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  return (
    <div className="modal-back" onMouseDown={() => app.setAddPersonOpen(false)}>
      <form
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          app.addPerson({ name, email, role })
        }}
      >
        <h2>Lägg till person</h2>
        <label>
          Namn
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Karin Wallin" />
        </label>
        <label>
          E-post
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="karin@studionord.se" />
        </label>
        <label>
          Roll
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Säljchef" />
        </label>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => app.setAddPersonOpen(false)}>
            Avbryt
          </button>
          <button type="submit" className="approve small" disabled={!name.trim()}>
            Lägg till
          </button>
        </div>
      </form>
    </div>
  )
}

function ActivityModal() {
  const app = useApp()
  const project = app.state.project!
  const draft = app.state.activityDraft!
  const owners = [...project.people, ...agentsFor(project.kind)].filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i)
  return (
    <div className="modal-back" onMouseDown={app.cancelActivityDraft}>
      <form
        className="modal"
        data-testid="activity-draft"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          app.commitActivity()
        }}
      >
        <p className="eyebrow">Förhandsvisning</p>
        <h2>Skapa aktivitet</h2>
        <label>
          Titel
          <input data-testid="activity-title" value={draft.title} onChange={(e) => app.patchActivityDraft({ title: e.target.value })} />
        </label>
        <label>
          Beskrivning
          <textarea value={draft.description} rows={5} onChange={(e) => app.patchActivityDraft({ description: e.target.value })} />
        </label>
        <label>
          Ägare
          <select value={draft.ownerId} onChange={(e) => app.patchActivityDraft({ ownerId: e.target.value })}>
            {owners.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.role}
              </option>
            ))}
          </select>
        </label>
        <p className="hint">Aktiviteten läggs till först när du bekräftar.</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={app.cancelActivityDraft}>
            Avbryt
          </button>
          <button type="submit" className="approve small" data-testid="confirm-activity" disabled={!draft.title.trim()}>
            Skapa aktivitet
          </button>
        </div>
      </form>
    </div>
  )
}

function DecisionModal() {
  const app = useApp()
  const draft = app.state.decisionDraft!
  return (
    <div className="modal-back" onMouseDown={app.cancelDecision}>
      <form
        className="modal"
        data-testid="decision-draft"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          app.commitDecision()
        }}
      >
        <p className="eyebrow">Beslut</p>
        <h2>Spara som beslut</h2>
        <label>
          Innehåll
          <textarea data-testid="decision-content" value={draft.content} rows={6} onChange={(e) => app.patchDecisionDraft(e.target.value)} />
        </label>
        <p className="hint">Datumet blir idag och beslutet länkas tillbaka till meddelandet.</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={app.cancelDecision}>
            Avbryt
          </button>
          <button type="submit" className="approve small" data-testid="confirm-decision" disabled={!draft.content.trim()}>
            Spara beslut
          </button>
        </div>
      </form>
    </div>
  )
}
