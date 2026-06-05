import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGuest, getMe, logout } from '../api/authApi'
import { getClips } from '../api/clipApi'

function ClipListPage() {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(null)
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
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

        const clipList = await getClips()

        setCurrentUser(user)
        setClips(clipList)
      } catch (error) {
        console.error(error)
        setErrorMessage('화면을 불러오는 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [])

  async function handleLogout() {
    try {
      setLoggingOut(true)
      setErrorMessage('')

      await logout()

      setCurrentUser(null)
      setClips([])

      navigate('/login')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '로그아웃 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">불러오는 중...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-violet-600">
                Audition Pocket
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                오디션 공고를 한곳에 모아 관리하세요
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                로그인 없이 바로 공고를 저장할 수 있어요. 이메일을 연동하면
                다른 기기에서도 안전하게 이어서 사용할 수 있습니다.
              </p>
            </div>

            {currentUser?.accountType === 'REGISTERED' && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                {loggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            )}
          </div>

          {currentUser && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              현재 상태:{' '}
              <span className="font-semibold text-slate-900">
                {currentUser.accountType}
              </span>
              {' / '}
              권한:{' '}
              <span className="font-semibold text-slate-900">
                {currentUser.role}
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/clips/new')}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              공고 추가하기
            </button>

            {currentUser?.accountType === 'GUEST' && (
              <button
                type="button"
                onClick={() => navigate('/link-email')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                이메일 연동하기
              </button>
            )}

            {currentUser?.accountType === 'GUEST' && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                기존 계정 로그인
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              내 오디션 공고
            </h2>

            <span className="text-sm text-slate-500">
              총 {clips.length}개
            </span>
          </div>

          {clips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                첫 번째 오디션 공고를 저장해보세요.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                OTR, 필름메이커스, 인스타그램, 카카오톡 공고 링크를 저장하고
                마감일과 지원 상태를 관리할 수 있어요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {clips.map((clip) => (
                <article
                  key={clip.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {clip.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        출처: {clip.sourceCode} · 상태: {clip.statusCode}
                      </p>

                      {clip.memo && (
                        <p className="mt-2 text-sm text-slate-600">
                          {clip.memo}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-right">
                      <p className="text-xs text-slate-500">마감</p>
                      <p className="text-sm font-semibold text-slate-900">
                        D-{clip.daysLeft}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default ClipListPage