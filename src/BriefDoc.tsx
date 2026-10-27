import { SECTIONS } from './content'
import type { Brief, BriefItem, ItemSection } from './types'

interface Props {
  brief: Brief
  onRename: (name: string) => void
  onEdit: (id: string, text: string) => void
  onConfirm: (id: string) => void
  onRemove: (id: string) => void
}

function Fact({
  item,
  onEdit,
  onConfirm,
  onRemove,
}: {
  item: BriefItem
  onEdit: (id: string, text: string) => void
  onConfirm: (id: string) => void
  onRemove: (id: string) => void
}) {
  const confirmed = item.origin === 'confirmed'
  return (
    <article className={confirmed ? 'fact fact--confirmed' : 'fact fact--assumption'} data-origin={item.origin} data-testid={confirmed ? 'fact-confirmed' : 'fact-assumption'}>
      <div className="fact-top">
        <span className="fact-label">{confirmed ? 'Bekräftat' : 'Antagande'}</span>
        <span className="fact-actions">
          {!confirmed && (
            <button type="button" onClick={() => onConfirm(item.id)}>
              Stämmer
            </button>
          )}
          <button type="button" onClick={() => onRemove(item.id)}>
            Ta bort
          </button>
        </span>
      </div>
      <textarea value={item.text} rows={Math.min(4, Math.max(2, Math.ceil(item.text.length / 70)))} onChange={(e) => onEdit(item.id, e.target.value)} />
    </article>
  )
}

export function BriefDoc({ brief, onRename, onEdit, onConfirm, onRemove }: Props) {
  const assumptions = brief.items.filter((item) => item.origin === 'assumption')
  return (
    <div className="brief-doc" data-testid="brief-doc">
      <p className="legend">Bekräftat är det du sagt. Antagande är det jag föreslagit och kan strykas.</p>
      {SECTIONS.map((section) => {
        if (section.id === 'name') {
          return (
            <section key={section.id} className="brief-section">
              <h3>{section.title}</h3>
              <article className={brief.nameOrigin === 'confirmed' ? 'fact fact--confirmed' : 'fact fact--assumption'} data-origin={brief.nameOrigin}>
                <span className="fact-label">{brief.nameOrigin === 'confirmed' ? 'Bekräftat' : 'Antagande'}</span>
                <input data-testid="brief-name" value={brief.projectName} onChange={(e) => onRename(e.target.value)} aria-label="Projektnamn" />
              </article>
            </section>
          )
        }
        if (section.id === 'assumptions') {
          return (
            <section key={section.id} className="brief-section">
              <h3>{section.title}</h3>
              {assumptions.map((item) => (
                <Fact key={`sum-${item.id}`} item={item} onEdit={onEdit} onConfirm={onConfirm} onRemove={onRemove} />
              ))}
              {brief.openQuestions.map((q) => (
                <p key={q.id} className="open-q" data-testid="open-question">
                  <span>Öppen fråga</span>
                  {q.text}
                </p>
              ))}
              {!assumptions.length && !brief.openQuestions.length && <p className="empty">Inga öppna frågor.</p>}
            </section>
          )
        }
        const items = brief.items.filter((item) => item.sectionId === (section.id as ItemSection))
        return (
          <section key={section.id} className="brief-section">
            <h3>{section.title}</h3>
            {items.length === 0 && <p className="empty">Inget här ännu.</p>}
            {items.map((item) => (
              <Fact key={item.id} item={item} onEdit={onEdit} onConfirm={onConfirm} onRemove={onRemove} />
            ))}
          </section>
        )
      })}
    </div>
  )
}
