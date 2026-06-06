import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGuest, getMe, linkEmail } from '../api/authApi'
import BackButton from '../components/BackButton'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import LoadingScreen from '../components/LoadingScreen'
import PageShell from '../components/PageShell'

function LinkEmailPage() {
  const navigate = useNavigate()
  const errorRef = useRef(null)

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
        showError('이메일 연동 화면을 불러오는 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [navigate])

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
    const trimmedName = name.trim()

    if (!trimmedEmail) {
      showError('이메일을 입력해주세요.')
      return
    }

    if (!password.trim()) {
      showError('비밀번호를 입력해주세요.')
      return
    }

    if (password.length < 8) {
      showError('비밀번호는 8자 이상 입력해주세요.')
      return
    }

    if (!trimmedName) {
      showError('이름을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await linkEmail({
        email: trimmedEmail,
        password,
        name: trimmedName,
      })

      navigate('/clips')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '이메일 연동 중 문제가 발생했습니다.'

      showError(message)
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
          연동 후에는 같은 이메일로 로그인해서 저장한 공고를 계속 이어서 볼
          수 있어요.
        </p>

        {currentUser && (
          <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-violet-700">
            현재 상태:{' '}
            <span className="font-semibold">{currentUser.accountType}</span>
            <br />
            이메일 연동을 완료하면 이 브라우저에 저장된 게스트 공고가 현재
            입력한 이메일 계정으로 연결됩니다.
          </div>
        )}

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
              placeholder="8자 이상 입력"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
            />

            <p className="mt-2 text-xs text-slate-500">
              나중에 이 이메일로 로그인할 때 사용할 비밀번호입니다.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              이름
            </label>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름 또는 닉네임"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/clips')}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 sm:w-auto"
            >
              나중에 하기
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
            >
              {submitting ? '연동 중...' : '이메일 연동하기'}
            </button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export default LinkEmailPage