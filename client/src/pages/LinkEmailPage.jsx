import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGuest, getMe, linkEmail } from '../api/authApi'
import BackButton from '../components/BackButton'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import LoadingScreen from '../components/LoadingScreen'
import PageShell from '../components/PageShell'

function LinkEmailPage() {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function initializePage() {
      try {
        setLoading(true)
        setErrorMessage('')

        let user

        try {
          user = await getMe()
        } catch {
          user = await createGuest()
        }

        setCurrentUser(user)

        if (user.accountType === 'REGISTERED') {
          navigate('/clips')
        }
      } catch (error) {
        console.error(error)
        setErrorMessage('이메일 연동 화면을 불러오는 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [navigate])

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

    if (password.length < 8) {
      setErrorMessage('비밀번호는 8자 이상 입력해주세요.')
      return
    }

    if (!name.trim()) {
      setErrorMessage('이름을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await linkEmail({
        email: email.trim(),
        password,
        name: name.trim(),
      })

      navigate('/clips')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '이메일 연동 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
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

        <h1 className="text-2xl font-bold text-slate-900">
          이메일 연동하기
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          지금까지 게스트로 저장한 오디션 공고를 이메일 계정에 연결합니다.
          연동 후에는 같은 이메일로 로그인해서 다시 이어서 사용할 수 있어요.
        </p>

        {currentUser && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            현재 상태:{' '}
            <span className="font-semibold text-slate-900">
              {currentUser.accountType}
            </span>
          </div>
        )}

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
              placeholder="8자 이상 입력"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              이름
            </label>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름 또는 닉네임"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? '연동 중...' : '이메일 연동하기'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/clips')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              나중에 하기
            </button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export default LinkEmailPage