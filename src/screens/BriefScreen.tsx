import { useEffect, useRef, useState } from 'react'
import { BriefDoc } from '../BriefDoc'
import { leadFor } from '../content'
import { useApp } from '../store'
import { AiBadge, IconSend, Portrait } from '../ui'

export function BriefScreen() {
  const { state, sendBrief, editName, editItemText, confirmFact, removeFact, approveBrief, backToProject } = useApp()
  const brief = state.brief
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [brief?.messages.length, state.briefTyping])

  if (!brief) return null
  const nora = leadFor(brief.kind)
  const lastId = brief.messages[brief.messages.length - 1]?.id

  function submit() {
    const next = text.trim()
    if (!next || state.briefTyping) return
    setText('')
    sendBrief(next)
  }

  return (
    <main className="brief-shell">
      <header className="brief-top">
        <span>Brief</span>
        {state.project && (
          <button type="button" className="quiet-link" onClick={backToProject}>
            Tillbaka till projektet
          </button>
        )}
      </header>
      <div className="brief-columns">
        <section className="brief-chat">
          <div className="transcript" aria-live="polite">
            {brief.messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="row row--me">
                  <div className="bubble bubble--me">{message.text}</div>
                </div>
              ) : (
                <div key={message.id} className="row row--agent">
                  <Portrait look={nora.look} name={nora.name} size={32} />
                  <div>
                    <div className="who-line">
                      <strong>{nora.name}</strong>
                      <AiBadge />
                    </div>
                    <div className="bubble">
                      {message.text.split('\n').map((line, i) => (
                        <p key={i}>{line || '\u00a0'}</p>
                      ))}
                    </div>
                    {message.id === lastId && !state.briefTyping && message.chips && message.chips.length > 0 && (
                      <div className="chips">
                        {message.chips.map((chip) => (
                          <button key={chip} type="button" className="chip" onClick={() => sendBrief(chip)}>
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
            {state.briefTyping && (
              <div className="row row--agent" data-testid="typing">
                <Portrait look={nora.look} name={nora.name} size={32} />
                <div className="bubble typing">Nora skriver…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <textarea
              data-testid="brief-input"
              value={text}
              placeholder="Skriv ett svar, eller be om en ändring i briefen."
              rows={2}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
            />
            <button className="send" type="submit" aria-label="Skicka" data-testid="brief-send" disabled={!text.trim() || state.briefTyping}>
              <IconSend />
            </button>
          </form>
        </section>
        <aside className="brief-side">
          <div className="brief-scroll">
            <BriefDoc brief={brief} onRename={editName} onEdit={editItemText} onConfirm={confirmFact} onRemove={removeFact} />
          </div>
          <button type="button" className="approve" data-testid="approve-brief" onClick={approveBrief} disabled={state.briefTyping}>
            Godkänn brief och fortsätt
          </button>
        </aside>
      </div>
    </main>
  )
}
