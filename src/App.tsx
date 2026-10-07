import { Route, Routes } from 'react-router-dom'

import { TopicPage } from './pages/TopicPage'
import { TopicsPage } from './pages/TopicsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopicsPage />} />
      <Route path="/topics/:topicId" element={<TopicPage />} />
    </Routes>
  )
}

export default App
