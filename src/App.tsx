import { AppProvider, useApp } from './store'
import { Mark } from './ui'
import { BriefScreen } from './screens/BriefScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { StartScreen } from './screens/StartScreen'
import { Workspace } from './screens/Workspace'

function Shell() {
  const { state } = useApp()
  if (state.phase === 'brief') return <BriefScreen />
  if (state.phase === 'review') return <ReviewScreen />
  if (state.phase === 'app') return <Workspace />
  return <StartScreen />
}

function FormaHeader() {
  const { state, goSection, backToProject } = useApp()
  const onWorkspace = state.phase === 'app' && state.section === 'chat'

  function openWorkspace() {
    if (state.phase === 'app') {
      goSection('chat')
      return
    }
    if (state.project) backToProject()
  }

  return (
    <header className="top">
      <nav className="nav" aria-label="Forma">
        <button type="button" className="brand" onClick={openWorkspace}>
          <Mark />
          <span className="brand-word">
            forma<span className="brand-dot">.</span>
          </span>
        </button>
        <span className="edition">DESIGNSYSTEM / 01</span>
        <div className="navlinks">
          <button type="button" className={onWorkspace ? 'is-on' : ''} onClick={openWorkspace}>
            Arbetsyta
          </button>
          <span>Grundsystem</span>
          <span>Komponenter</span>
          <span>Principer ↗</span>
        </div>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <AppProvider>
      <div className="page">
        <FormaHeader />
        <Shell />
      </div>
    </AppProvider>
  )
}
