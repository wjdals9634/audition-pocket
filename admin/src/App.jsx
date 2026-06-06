import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { getMe } from './api/authApi'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminTagPage from './pages/AdminTagPage'
import AdminCommonCodePage from './pages/AdminCommonCodePage'
import AdminUserPage from './pages/AdminUserPage'
import AdminClipPage from './pages/AdminClipPage'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getMe()

        if (user.role === 'ADMIN') {
          setCurrentUser(user)
        } else {
          setCurrentUser(null)
        }
      } catch {
        setCurrentUser(null)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">관리자 권한 확인 중...</p>
      </main>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <AdminLoginPage onLogin={setCurrentUser} />
          )
        }
      />

      <Route
        path="/"
        element={
          currentUser ? (
            <AdminDashboardPage
              currentUser={currentUser}
              onLogout={() => setCurrentUser(null)}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/tags"
        element={
          currentUser ? (
            <AdminTagPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/common-codes"
        element={
          currentUser ? (
            <AdminCommonCodePage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/users"
        element={
          currentUser ? (
            <AdminUserPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/clips"
        element={
          currentUser ? (
            <AdminClipPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App