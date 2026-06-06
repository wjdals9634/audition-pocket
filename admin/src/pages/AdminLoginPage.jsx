import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, logout } from '../api/authApi'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import PageShell from '../components/PageShell'

function AdminLoginPage({
  onLogin,
}) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting) {
      return
    }

    if (!email.trim()) {
      setErrorMessage('이메일을 입력해주세요.')
      return
    }

    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      const user = await login({
        email: email.trim(),
        password,
      })

      if (user.role !== 'ADMIN') {
        await logout()
        setErrorMessage('관리자 권한이 없습니다.')
        return
      }

      onLogin(user)
      navigate('/')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '관리자 로그인 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell maxWidth="max-w-xl">
      <Card>
        <p className="mb-2 text-sm font-medium text-violet-600">
          Audition Pocket Admin
        </p>

        <h1 className="text-2xl font-bold text-slate-900">
          관리자 로그인
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          관리자 계정으로 로그인해야 운영 페이지에 접근할 수 있습니다.
        </p>

        <ErrorMessage message={errorMessage} className="mt-5" />

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              이메일
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@auditionpocket.com"
              autoComplete="username"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              비밀번호
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="관리자 비밀번호"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? '로그인 중...' : '관리자 로그인'}
          </button>
        </form>
      </Card>
    </PageShell>
  )
}

export default AdminLoginPage