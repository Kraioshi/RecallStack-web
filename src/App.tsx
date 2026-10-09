import { Route, Routes, useParams } from 'react-router-dom'

import { PracticePage } from './pages/PracticePage'
import { TopicPage } from './pages/TopicPage'
import { TopicsPage } from './pages/TopicsPage'

// Remount topic state when the URL changes to another topic.
function TopicRoute() {
  const { topicId } = useParams<{ topicId: string }>()
  return <TopicPage key={topicId} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopicsPage />} />
      <Route path="/topics/:topicId" element={<TopicRoute />} />
      <Route path="/practice" element={<PracticePage />} />
    </Routes>
  )
}

export default App
