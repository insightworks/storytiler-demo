import { useEffect, useState } from 'react'
import { BriefDoc } from '../BriefDoc'
import {
  currentPhase,
  findPerson,
  leadSummary,
  myTasks,
  nowLine,
  recommendedSteps,
  SAMPLE_ROWS,
} from '../content'
import { formatDay, formatShort, statusLabel, cn } from '../format'
import { useApp } from '../store'
import type { Activity, Status } from '../types'
import { AiBadge, Portrait } from '../ui'

const COLUMNS: Status[] = ['todo', 'doing', 'waiting', 'done']

export function OverviewPane() {
  const { state, openActivityByKey, openActivity, gotoMessage } = useApp()
  const project = state.project
  if (!project) return null
  const phase = currentPhase(project)
  const tasks = myTasks(project)
  const blockers = [
    ...project.activities.flatMap((a) => (a.status === 'waiting' || a.blockers.length ? (a.blockers.length ? a.blockers : [`${a.title} väntar på input.`]) : [])),
    ...project.brief.openQuestions.map((q) => `Öppen fråga: ${q.text}`),
  ]
  const agentIds = new Set(project.people.filter((p) => p.kind === 'agent').map((p) => p.id))
  for (const activity of project.activities) {
    const owner = findPerson(activity.ownerId, project.kind, project.people)
    if (owner?.kind === 'agent') agentIds.add(owner.id)
  }
  return (
    <div className="pane overview" data-testid="overview">
      <section>
        <h2>Var står projektet?</h2>
        <p className="phase-line">
          Fas: {phase.title} · {phase.period}
        </p>
        <article className="summary">
          <Portrait look="nora" name="Nora Ek" size={36} />
          <div>
            <div className="who-line">
              <strong>Nora Ek</strong>
              <AiBadge />
            </div>
            <p>{leadSummary(project)}</p>
          </div>
        </article>
      </section>
      <section>
        <h2>Vad är nästa steg?</h2>
        <h3>Nästa rekommenderade steg</h3>
        <ol className="rec">
          {recommendedSteps(project).map((step) => (
            <li key={step.activityKey}>
              <button type="button" onClick={() => openActivityByKey(step.activityKey)}>
                {step.label}
              </button>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2>Vad behöver jag göra?</h2>
        {tasks.length === 0 && <p className="empty">Inget ligger på dig just nu.</p>}
        <ul className="task-list">
          {tasks.map((activity) => (
            <li key={activity.id}>
              <button type="button" onClick={() => openActivity(activity.id)}>
                {activity.title}
              </button>
              <span className={activity.status === 'waiting' ? 'pill is-wait' : 'pill'}>{statusLabel(activity.status)}</span>
              {activity.needsHuman && <p className="need">{activity.needsHuman}</p>}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Vad arbetar agenterna med?</h2>
        {[...agentIds].map((id) => {
          const person = findPerson(id, project.kind, project.people)
          if (!person) return null
          const owned = project.activities.filter((a) => a.ownerId === id && a.status !== 'done')
          const onTeam = project.people.some((p) => p.id === id)
          return (
            <article key={id} className="agent-work">
              <header>
                <Portrait look={person.look} name={person.name} size={28} />
                <strong>{person.name}</strong>
                <AiBadge />
                <span>{person.role}</span>
                {!onTeam && <span className="muted">Inte tillagd i teamet</span>}
              </header>
              <p>{nowLine(id, project)}</p>
              <ul>
                {owned.map((activity) => (
                  <li key={activity.id}>
                    <button type="button" onClick={() => openActivity(activity.id)}>
                      {activity.title}
                    </button>
                    <span className={activity.status === 'waiting' ? 'pill is-wait' : 'pill'}>{statusLabel(activity.status)}</span>
                    {activity.agentCanStart && <em className="can">Kan börja direkt</em>}
                    {activity.needsHuman && <p className="need">{activity.needsHuman}</p>}
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </section>
      <section>
        <h2>Vad blockerar arbetet?</h2>
        {blockers.length === 0 && <p className="empty">Inget blockerar just nu.</p>}
        <ul className="plain">
          {blockers.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {project.decisions.length > 0 && (
          <div className="decision-list">
            <h3>Beslut</h3>
            {project.decisions.map((d) => (
              <button key={d.id} type="button" className="result-card result-card--decision" onClick={() => gotoMessage(d.chatId, d.messageId)}>
                <span>Beslut · {formatDay(d.createdAt)}</span>
                <p>{d.content}</p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function TasksPane() {
  const { state, openActivity } = useApp()
  const project = state.project
  if (!project) return null
  const tasks = myTasks(project)
  return (
    <div className="pane">
      <h2>Mina uppgifter</h2>
      {tasks.length === 0 && <p className="empty">Inget ligger på dig just nu.</p>}
      <ul className="task-list">
        {tasks.map((activity) => (
          <li key={activity.id}>
            <button type="button" onClick={() => openActivity(activity.id)}>
              {activity.title}
            </button>
            <p>{activity.description}</p>
            {activity.needsHuman && <p className="need">{activity.needsHuman}</p>}
            <span className={activity.status === 'waiting' ? 'pill is-wait' : 'pill'}>{statusLabel(activity.status)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ActivitiesPane() {
  const { state, setActivityView, setActivityStatus, openActivity } = useApp()
  const project = state.project
  const [dragId, setDragId] = useState<string | null>(null)
  useEffect(() => {
    if (!state.highlightActivityId) return
    document.getElementById(`activity-${state.highlightActivityId}`)?.scrollIntoView({ block: 'center' })
  }, [state.highlightActivityId])
  if (!project) return null

  return (
    <div className="pane">
      <div className="pane-head">
        <h2>Aktiviteter</h2>
        <div className="seg">
          <button type="button" className={state.activityView === 'list' ? 'is-on' : ''} data-testid="view-list" onClick={() => setActivityView('list')}>
            Lista
          </button>
          <button type="button" className={state.activityView === 'board' ? 'is-on' : ''} data-testid="view-kanban" onClick={() => setActivityView('board')}>
            Kanban
          </button>
        </div>
      </div>
      {state.activityView === 'list' ? (
        <ul className="activity-list">
          {project.activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} highlight={activity.id === state.highlightActivityId} onOpen={() => openActivity(activity.id)} onStatus={(status) => setActivityStatus(activity.id, status)} />
          ))}
        </ul>
      ) : (
        <div className="board" data-testid="kanban">
          {COLUMNS.map((status) => (
            <section
              key={status}
              className={status === 'waiting' ? 'column is-wait' : 'column'}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) setActivityStatus(dragId, status)
                setDragId(null)
              }}
            >
              <h3>
                {statusLabel(status)}
                <span>{project.activities.filter((a) => a.status === status).length}</span>
              </h3>
              {project.activities
                .filter((a) => a.status === status)
                .map((activity) => {
                  const owner = findPerson(activity.ownerId, project.kind, project.people)
                  return (
                    <article
                      key={activity.id}
                      id={`activity-${activity.id}`}
                      className={cn('board-card', activity.id === state.highlightActivityId && 'is-highlight')}
                      draggable
                      onDragStart={() => setDragId(activity.id)}
                    >
                      <button type="button" onClick={() => openActivity(activity.id)}>
                        {activity.title}
                      </button>
                      {owner && (
                        <p className="owner-line">
                          <Portrait look={owner.look} name={owner.name} size={18} />
                          {owner.name}
                        </p>
                      )}
                      {activity.agentCanStart && <em className="can">Kan börja direkt</em>}
                      {activity.needsHuman && <em className="need">{activity.needsHuman}</em>}
                    </article>
                  )
                })}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityRow({
  activity,
  highlight,
  onOpen,
  onStatus,
}: {
  activity: Activity
  highlight: boolean
  onOpen: () => void
  onStatus: (status: Status) => void
}) {
  const { state } = useApp()
  const project = state.project!
  const owner = findPerson(activity.ownerId, project.kind, project.people)
  return (
    <li id={`activity-${activity.id}`} className={cn('activity-row', highlight && 'is-highlight')}>
      <div>
        <button type="button" className="activity-title" onClick={onOpen}>
          {activity.title}
        </button>
        <p>{activity.description}</p>
        <div className="row-meta">
          {owner && (
            <span>
              <Portrait look={owner.look} name={owner.name} size={18} />
              {owner.name}
            </span>
          )}
          {activity.deadline && <span>{formatShort(activity.deadline)}</span>}
          {activity.agentCanStart && <em className="can">Kan börja direkt</em>}
          {activity.needsHuman && <em className="need">{activity.needsHuman}</em>}
        </div>
      </div>
      <select aria-label={`Status för ${activity.title}`} value={activity.status} onChange={(e) => onStatus(e.target.value as Status)}>
        {COLUMNS.map((status) => (
          <option key={status} value={status}>
            {statusLabel(status)}
          </option>
        ))}
      </select>
    </li>
  )
}

export function TeamPane() {
  const { state, openDm, setChat, setInviteOpen } = useApp()
  const project = state.project
  if (!project) return null
  const projectChat = project.chats.find((c) => c.kind === 'project')
  return (
    <div className="pane">
      <h2>Team</h2>
      <div className="team-grid">
        {project.people.map((person) => {
          const inChat = projectChat?.participantIds.includes(person.id)
          return (
            <article key={person.id} className="team-card is-on">
              <header>
                <Portrait look={person.look} name={person.name} size={48} />
                <div>
                  <strong>
                    {person.name} {person.kind === 'agent' && <AiBadge />}
                  </strong>
                  <p>{person.role}</p>
                  {person.email && <p className="muted">{person.email}</p>}
                </div>
              </header>
              {person.skills.length > 0 && (
                <ul className="skills">
                  {person.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              )}
              {person.why && <p>{person.why}</p>}
              {person.examples.length > 0 && (
                <ul className="examples-list">
                  {person.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              )}
              {person.id !== 'fredrik' && (
                <button type="button" className="ghost" onClick={() => openDm(person.id)}>
                  Skicka meddelande
                </button>
              )}
              {person.kind === 'agent' && !inChat && (
                <button type="button" className="text-btn" onClick={() => { if (projectChat) setChat(projectChat.id); setInviteOpen(true) }}>
                  Bjud in till projektchatten
                </button>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function BriefPane() {
  const { state, editName, editItemText, confirmFact, removeFact, gotoMessage } = useApp()
  const project = state.project
  const [fileOpen, setFileOpen] = useState(false)
  if (!project) return null
  const files = project.chats.flatMap((chat) => chat.messages.filter((m) => m.attachmentName).map((m) => ({ chat, message: m })))
  return (
    <div className="pane brief-pane">
      <h2>Projektbrief och dokument</h2>
      <ul className="doc-list">
        <li>Godkänd projektbrief</li>
        {project.decisions.map((d) => (
          <li key={d.id}>
            <button type="button" onClick={() => gotoMessage(d.chatId, d.messageId)}>
              Beslut · {formatDay(d.createdAt)}
            </button>
          </li>
        ))}
        {files.map(({ message }) => (
          <li key={message.id}>
            <button type="button" onClick={() => setFileOpen(true)}>
              {message.attachmentName}
            </button>
          </li>
        ))}
      </ul>
      {fileOpen && (
        <div className="file-preview">
          <h3>forsaljning-oktober-2026.csv</h3>
          <p>Utdrag, inte hela historiken. Intäkt mot mål ligger i Fortnox och finns inte i den här filen.</p>
          <table>
            <thead>
              <tr>
                {['Affär', 'Steg', 'Värde', 'Ägare', 'Stängning'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <BriefDoc brief={project.brief} onRename={editName} onEdit={editItemText} onConfirm={confirmFact} onRemove={removeFact} />
      {project.decisions.length > 0 && (
        <section>
          <h3>Sparade beslut</h3>
          {project.decisions.map((d) => (
            <article key={d.id} className="result-card result-card--decision">
              <span>Beslut · {formatDay(d.createdAt)}</span>
              <p>{d.content}</p>
              <button type="button" className="text-btn" onClick={() => gotoMessage(d.chatId, d.messageId)}>
                Visa i samtalet
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

export function SettingsPane() {
  const [notes, setNotes] = useState(true)
  const [weekly, setWeekly] = useState(false)
  return (
    <div className="pane settings">
      <h2>Inställningar</h2>
      <label>
        Namn
        <input value="Fredrik" readOnly />
      </label>
      <label>
        E-post
        <input value="fredrik@studionord.se" readOnly />
      </label>
      <label className="check">
        <input type="checkbox" checked={notes} onChange={(e) => setNotes(e.target.checked)} />
        Aviseringar i samtal
      </label>
      <label className="check">
        <input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} />
        Veckosammanfattning
      </label>
      <p className="hint">Det här är en demo. Svaren simuleras lokalt och skickas inte till någon extern tjänst.</p>
    </div>
  )
}

export function ActivityDetail() {
  const { state, openActivity, gotoMessage, setActivityStatus } = useApp()
  const project = state.project
  const activity = project?.activities.find((a) => a.id === state.openActivityId)
  if (!project || !activity) return null
  const owner = findPerson(activity.ownerId, project.kind, project.people)
  const contributors = activity.contributorIds.map((id) => findPerson(id, project.kind, project.people)).filter(Boolean)
  const deps = activity.dependsOn.map((key) => project.activities.find((a) => a.key === key)?.title ?? key)
  return (
    <div className="modal-back" onMouseDown={openActivity.bind(null, null)}>
      <article className="modal" onMouseDown={(e) => e.stopPropagation()} data-testid="activity-detail">
        <p className="eyebrow">Aktivitet</p>
        <h2>{activity.title}</h2>
        <p>{activity.description}</p>
        <label>
          Status
          <select aria-label={`Status för ${activity.title}`} value={activity.status} onChange={(e) => setActivityStatus(activity.id, e.target.value as Status)}>
            {COLUMNS.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        {owner && (
          <p className="owner-line">
            Ägare <Portrait look={owner.look} name={owner.name} size={20} /> {owner.name}
            {owner.kind === 'agent' && <AiBadge />}
          </p>
        )}
        {contributors.length > 0 && <p>Medverkande: {contributors.map((p) => p!.name).join(', ')}</p>}
        {activity.deadline && <p>Deadline {formatShort(activity.deadline)}</p>}
        {deps.length > 0 && <p>Beror på: {deps.join(', ')}</p>}
        {activity.blockers.map((b) => (
          <p key={b} className="need">
            {b}
          </p>
        ))}
        {activity.agentCanStart && <p className="can">Agenten kan börja direkt.</p>}
        {activity.needsHuman && <p className="need">{activity.needsHuman}</p>}
        {activity.chatId && activity.messageId && (
          <button type="button" className="text-btn" onClick={() => gotoMessage(activity.chatId!, activity.messageId!)}>
            Öppna i chatten
          </button>
        )}
        <button type="button" className="ghost" onClick={() => openActivity(null)}>
          Stäng
        </button>
      </article>
    </div>
  )
}
