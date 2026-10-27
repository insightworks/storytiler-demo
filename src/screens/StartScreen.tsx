import { useState } from 'react'
import { SEED } from '../content'
import { useApp } from '../store'
import { IconSend, Mark } from '../ui'

const EXAMPLES = ['Skapa en dashboard.', 'Planera en lansering.', 'Utveckla en ny tjänst.']

export function StartScreen() {
  const { sendStart, state, backToProject } = useApp()
  const [text, setText] = useState('')

  function submit(value: string) {
    const next = value.trim()
    if (!next) return
    sendStart(next)
  }

  return (
    <main className="stage">
      <div className="stage-inner">
        <Mark size={36} />
        <h1>Vad vill du åstadkomma?</h1>
        <form
          className="start-field"
          onSubmit={(e) => {
            e.preventDefault()
            submit(text)
          }}
        >
          <textarea
            data-testid="start-input"
            value={text}
            placeholder={SEED}
            rows={3}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit(text)
              }
            }}
          />
          <button className="send" type="submit" aria-label="Skicka" disabled={!text.trim()}>
            <IconSend />
          </button>
        </form>
        <div className="examples">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" className="example" onClick={() => submit(example)}>
              {example}
            </button>
          ))}
        </div>
        {state.project && (
          <button type="button" className="quiet-link" onClick={backToProject}>
            Tillbaka till {state.project.name}
          </button>
        )}
      </div>
    </main>
  )
}
