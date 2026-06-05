import { Navigate, Route, Routes } from 'react-router-dom'
import ClipCreatePage from './pages/ClipCreatePage'
import ClipListPage from './pages/ClipListPage'
import LinkEmailPage from './pages/LinkEmailPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/clips" replace />} />
      <Route path="/clips" element={<ClipListPage />} />
      <Route path="/clips/new" element={<ClipCreatePage />} />
      <Route path="/link-email" element={<LinkEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default App