import { AppProvider, useApp } from './store'
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

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
