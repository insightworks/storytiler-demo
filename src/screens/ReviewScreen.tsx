import { useState, type FormEvent } from 'react'
import { agentsFor, dependencyNotes, milestonesFor, phasesFor, reviewSummary } from '../content'
import { useApp } from '../store'
import type { Person } from '../types'
import { AiBadge, Portrait } from '../ui'
import { cn } from '../format'

export function ReviewScreen() {
  const { state, toggleMember, addPerson, removeExtra, openWorkspace, backToBrief } = useApp()
  const brief = state.brief
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  if (!brief) return null
  const team = agentsFor(brief.kind)
  const phases = phasesFor(brief.kind)
  const milestones = milestonesFor(brief.kind)

  function submitPerson(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addPerson({ name, email, role })
    setName('')
    setEmail('')
    setRole('')
  }

  return (
    <main className="review-shell">
      <header className="brief-top">
        <span>Granska team och plan</span>
        <button type="button" className="quiet-link" onClick={backToBrief}>
          Tillbaka till briefen
        </button>
      </header>
      <div className="review">
        <section className="review-block">
          <h1>{brief.projectName}</h1>
          <p className="lead">{reviewSummary(brief)}</p>
        </section>

        <section className="review-block">
          <h2>Faser och milstolpar</h2>
          <div className="phase-grid">
            {phases.map((phase, index) => (
              <article key={phase.title} className="phase">
                <span>Fas {index + 1}</span>
                <strong>{phase.title}</strong>
                <em>{phase.period}</em>
                <p>{phase.detail}</p>
              </article>
            ))}
          </div>
          <ul className="milestones">
            {milestones.map((m) => (
              <li key={m.title}>
                <b>{m.date}</b>
                {m.title}
              </li>
            ))}
          </ul>
        </section>

        <section className="review-block">
          <h2>Första aktiviteter</h2>
          <ul className="plan-list">
            {previewActivities(brief.kind).map((row) => (
              <li key={row.title}>
                <div>
                  <strong>{row.title}</strong>
                  <p>{row.note}</p>
                </div>
                <span className={row.wait ? 'pill is-wait' : 'pill is-go'}>{row.wait ? 'Väntar på er' : 'Agenten kan börja'}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="review-block split">
          <div>
            <h2>Öppna frågor</h2>
            {brief.openQuestions.length === 0 && <p className="empty">Inga öppna frågor.</p>}
            <ul className="plain">
              {brief.openQuestions.map((q) => (
                <li key={q.id}>{q.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Beroenden</h2>
            <ul className="plain">
              {dependencyNotes(brief.kind).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="review-block" data-testid="team-review">
          <h2>Rekommenderat team</h2>
          <p className="hint">Projektledaren ingår alltid. Ta bort den specialist du inte vill ha med, eller lägg till en person.</p>
          <div className="team-grid">
            {team.map((person) => (
              <AgentChoice key={person.id} person={person} selected={state.teamIds.includes(person.id)} onToggle={() => toggleMember(person.id)} />
            ))}
            {state.extras.map((person) => (
              <article key={person.id} className="team-card is-on">
                <header>
                  <Portrait look={person.look} name={person.name} size={44} />
                  <div>
                    <strong>{person.name}</strong>
                    <p>{person.role}</p>
                    {person.email && <p className="muted">{person.email}</p>}
                  </div>
                </header>
                <button type="button" className="text-btn" onClick={() => removeExtra(person.id)}>
                  Ta bort
                </button>
              </article>
            ))}
          </div>
          <form className="add-person" data-testid="add-person-form" onSubmit={submitPerson}>
            <h3>Lägg till en person</h3>
            <input data-testid="add-person-name" value={name} placeholder="Namn, till exempel Karin Wallin" onChange={(e) => setName(e.target.value)} />
            <input value={email} placeholder="E-post" onChange={(e) => setEmail(e.target.value)} />
            <input value={role} placeholder="Roll, till exempel säljchef" onChange={(e) => setRole(e.target.value)} />
            <button type="submit" className="ghost">
              Lägg till
            </button>
          </form>
        </section>

        <button type="button" className="approve" data-testid="open-workspace" onClick={openWorkspace}>
          Öppna arbetsytan
        </button>
      </div>
    </main>
  )
}

function AgentChoice({ person, selected, onToggle }: { person: Person; selected: boolean; onToggle: () => void }) {
  return (
    <label className={cn('team-card', selected && 'is-on')}>
      <header>
        <Portrait look={person.look} name={person.name} size={48} />
        <div>
          <strong>
            {person.name} <AiBadge />
          </strong>
          <p>
            {person.role}
            {person.lead ? ' · ingår alltid' : ''}
          </p>
        </div>
        <input type="checkbox" checked={selected} disabled={person.lead} onChange={onToggle} aria-label={person.name} />
      </header>
      <ul className="skills">
        {person.skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
      <p>{person.why}</p>
      <ul className="examples-list">
        {person.examples.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </ul>
    </label>
  )
}

function previewActivities(kind: string): { title: string; note: string; wait: boolean }[] {
  if (kind === 'dashboard') {
    return [
      { title: 'Ladda upp datautdrag', note: 'Fredrik. Behöver en människa.', wait: true },
      { title: 'Föreslå nyckeltal för version 1', note: 'Elias kan skriva definitionerna direkt.', wait: false },
      { title: 'Granska datakvaliteten', note: 'Elias. Väntar på utdraget.', wait: true },
      { title: 'Föreslå diagram till måndagsmötet', note: 'Saga. Väntar på bekräftade nyckeltal.', wait: true },
      { title: 'Skissa flödet för måndagsmötet', note: 'Amir kan börja direkt.', wait: false },
    ]
  }
  if (kind === 'launch') {
    return [
      { title: 'Bekräfta vad som lanseras och för vem', note: 'Behöver er.', wait: true },
      { title: 'Ta fram budskap och kanaler', note: 'Väntar på det beskedet.', wait: true },
      { title: 'Skissa lanseringssidan', note: 'Väntar på budskapet.', wait: true },
    ]
  }
  return [
    { title: 'Beskriv problemet och de första användarna', note: 'Behöver er.', wait: true },
    { title: 'Avgränsa första versionen', note: 'Kan skissas direkt.', wait: false },
    { title: 'Sammanställ underlag', note: 'Väntar på problembeskrivningen.', wait: true },
  ]
}
