import { Route, Routes } from 'react-router-dom'

import { TopicsPage } from './pages/TopicsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopicsPage />} />
    </Routes>
  )
}

export default App
