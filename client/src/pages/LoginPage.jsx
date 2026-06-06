import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'
import BackButton from '../components/BackButton'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import PageShell from '../components/PageShell'

function LoginPage() {
  const navigate = useNavigate()
  const errorRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function showError(message) {
    setErrorMessage(message)

    window.setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 0)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      showError('이메일을 입력해주세요.')
      return
    }

    if (!password.trim()) {
      showError('비밀번호를 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await login({
        email: trimmedEmail,
        password,
      })

      navigate('/clips')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '로그인 중 문제가 발생했습니다.'

      showError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell maxWidth="max-w-xl">
      <div className="mb-6">
        <BackButton onClick={() => navigate('/clips')} />
      </div>

      <Card>
        <p className="mb-2 text-sm font-medium text-violet-600">
          Audition Pocket
        </p>

        <h1 className="text-2xl font-bold text-slate-900">로그인</h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          이메일 연동을 완료한 계정으로 로그인하면 저장해둔 오디션 공고를
          다시 이어서 볼 수 있어요.
        </p>

        <div ref={errorRef}>
          <ErrorMessage message={errorMessage} className="mt-5" />
        </div>

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
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
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
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/clips')}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 sm:w-auto"
            >
              로그인 없이 사용하기
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
            >
              {submitting ? '로그인 중...' : '로그인하기'}
            </button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export default LoginPage