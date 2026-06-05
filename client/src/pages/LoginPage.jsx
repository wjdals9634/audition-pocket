import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

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

      await login({
        email: email.trim(),
        password,
      })

      navigate('/clips')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '로그인 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-xl px-4 py-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/clips')}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            ← 목록으로 돌아가기
          </button>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-violet-600">
            Audition Pocket
          </p>

          <h1 className="text-2xl font-bold text-slate-900">로그인</h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            이메일 연동을 완료한 계정으로 로그인하면 저장해둔 오디션 공고를
            다시 이어서 볼 수 있어요.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                이메일
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
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
                placeholder="비밀번호 입력"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? '로그인 중...' : '로그인하기'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/clips')}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                로그인 없이 사용하기
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginPage