import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGuest, getMe, logout } from '../api/authApi'
import { getClips } from '../api/clipApi'
import { getCommonCodes } from '../api/commonCodeApi'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import LoadingScreen from '../components/LoadingScreen'
import PageShell from '../components/PageShell'

function ClipListPage() {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(null)
  const [clips, setClips] = useState([])
  const [statusCodes, setStatusCodes] = useState([])
  const [sourceCodes, setSourceCodes] = useState([])

  const [keyword, setKeyword] = useState('')
  const [statusCode, setStatusCode] = useState('')
  const [sourceCode, setSourceCode] = useState('')
  const [sort, setSort] = useState('RECENT')

  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
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

        const [clipList, clipStatuses, clipSources] = await Promise.all([
          getClips({ sort: 'RECENT' }),
          getCommonCodes('CLIP_STATUS'),
          getCommonCodes('CLIP_SOURCE'),
        ])

        setCurrentUser(user)
        setClips(clipList)
        setStatusCodes(clipStatuses)
        setSourceCodes(clipSources)
      } catch (error) {
        console.error(error)
        setErrorMessage('화면을 불러오는 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [])

  function getStatusLabel(code) {
    const status = statusCodes.find((item) => item.code === code)
    return status ? status.label : code || '-'
  }

  function getSourceLabel(code) {
    const source = sourceCodes.find((item) => item.code === code)
    return source ? source.label : code || '-'
  }

  function getDaysLeftText(daysLeft) {
    if (daysLeft === null || daysLeft === undefined) return '-'
    if (daysLeft < 0) return `마감 ${Math.abs(daysLeft)}일 지남`
    if (daysLeft === 0) return '오늘 마감'
    return `D-${daysLeft}`
  }

  function hasActiveFilters() {
    return Boolean(keyword.trim() || statusCode || sourceCode || sort !== 'RECENT')
  }

  async function fetchClipsWithFilters(nextValues = {}) {
    const nextKeyword = nextValues.keyword !== undefined ? nextValues.keyword : keyword
    const nextStatusCode = nextValues.statusCode !== undefined ? nextValues.statusCode : statusCode
    const nextSourceCode = nextValues.sourceCode !== undefined ? nextValues.sourceCode : sourceCode
    const nextSort = nextValues.sort !== undefined ? nextValues.sort : sort

    try {
      setFiltering(true)
      setErrorMessage('')

      const params = { sort: nextSort }

      if (nextKeyword.trim()) params.keyword = nextKeyword.trim()
      if (nextStatusCode) params.statusCode = nextStatusCode
      if (nextSourceCode) params.sourceCode = nextSourceCode

      const clipList = await getClips(params)
      setClips(clipList)
    } catch (error) {
      console.error(error)
      const message =
        error.response?.data?.message || '공고 목록을 불러오는 중 문제가 발생했습니다.'
      setErrorMessage(message)
    } finally {
      setFiltering(false)
    }
  }

  function handleKeywordChange(event) {
    setKeyword(event.target.value)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    fetchClipsWithFilters({ keyword })
  }

  function handleStatusChange(event) {
    const value = event.target.value
    setStatusCode(value)
    fetchClipsWithFilters({ statusCode: value })
  }

  function handleSourceChange(event) {
    const value = event.target.value
    setSourceCode(value)
    fetchClipsWithFilters({ sourceCode: value })
  }

  function handleSortChange(event) {
    const value = event.target.value
    setSort(value)
    fetchClipsWithFilters({ sort: value })
  }

  function handleResetFilters() {
    setKeyword('')
    setStatusCode('')
    setSourceCode('')
    setSort('RECENT')
    fetchClipsWithFilters({ keyword: '', statusCode: '', sourceCode: '', sort: 'RECENT' })
  }

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
      const message = error.response?.data?.message || '로그아웃 중 문제가 발생했습니다.'
      setErrorMessage(message)
    } finally {
      setLoggingOut(false)
    }
  }

  const urgentCount = clips.filter(
    (clip) =>
      clip.daysLeft !== null &&
      clip.daysLeft !== undefined &&
      clip.daysLeft >= 0 &&
      clip.daysLeft <= 7
  ).length

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <PageShell maxWidth="max-w-5xl">
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <section className="mb-3">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold leading-none text-violet-600">Audition Pocket</p>
              <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-950 md:text-xl">
                내 오디션 공고
              </h1>
            </div>

            <div className="relative flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHelp((value) => !value)}
                aria-label="도움말"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm"
              >
                ?
              </button>

              <button
                type="button"
                onClick={() => setShowAccountMenu((value) => !value)}
                aria-label="계정"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 top-11 z-20 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  {currentUser?.accountType === 'GUEST' && (
                    <>
                      <p className="px-2 pb-2 text-xs font-semibold text-violet-600">
                        게스트로 이용 중
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/link-email')}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-violet-50"
                      >
                        이메일 연동하기
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-violet-50"
                      >
                        기존 계정 로그인
                      </button>
                    </>
                  )}

                  {currentUser?.accountType === 'REGISTERED' && (
                    <>
                      <p className="px-2 pb-2 text-xs text-slate-500">로그인 계정</p>
                      <p className="break-all px-2 pb-3 text-sm font-semibold text-slate-900">
                        {currentUser.email}
                      </p>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {loggingOut ? '로그아웃 중...' : '로그아웃'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-2.5">
            <div className="flex gap-2">
              <label className="relative min-w-0 flex-1">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16.5 16.5 4 4" />
                </svg>
                <input
                  value={keyword}
                  onChange={handleKeywordChange}
                  placeholder="공고명, 메모, 키워드 검색"
                  className="h-10 w-full rounded-2xl border-0 bg-slate-100 pl-9 pr-3 text-base font-semibold text-slate-900 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 md:h-10 md:text-sm"
                />
              </label>

              <button
                type="button"
                onClick={() => navigate('/clips/new')}
                className="flex h-10 min-w-21 shrink-0 items-center justify-center gap-1 rounded-2xl bg-slate-800 px-3.5 text-sm font-bold text-white shadow-sm md:h-10"
              >
                <span className="text-base leading-none">+</span>
                <span>추가</span>
              </button>
            </div>

            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
              <select
                value={statusCode}
                onChange={handleStatusChange}
                className="h-9 min-w-22 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-violet-500 md:h-9 md:min-w-24"
              >
                <option value="">상태</option>
                {statusCodes.map((item) => (
                  <option key={item.id} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={sourceCode}
                onChange={handleSourceChange}
                className="h-9 min-w-22 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-violet-500 md:h-9 md:min-w-24"
              >
                <option value="">출처</option>
                {sourceCodes.map((item) => (
                  <option key={item.id} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={handleSortChange}
                className="h-9 min-w-22 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-violet-500 md:h-9 md:min-w-24"
              >
                <option value="RECENT">최근</option>
                <option value="DEADLINE_ASC">마감임박</option>
              </select>

              <button
                type="submit"
                disabled={filtering}
                className="h-9 min-w-16 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white disabled:opacity-50 md:h-9"
              >
                {filtering ? '...' : '검색'}
              </button>

              {hasActiveFilters() && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={filtering}
                  className="h-9 min-w-16 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 disabled:opacity-50 md:h-9"
                >
                  초기화
                </button>
              )}
            </div>
          </form>

          {showHelp && (
            <div className="mt-2 rounded-2xl bg-violet-50 px-3 py-2.5 text-xs leading-5 text-violet-700 md:text-sm">
              OTR, 필름메이커스, 인스타그램, 유튜브, 카카오톡 단톡방에서 본 공고를 저장할 수 있어요.
              게스트 데이터는 현재 브라우저에 연결되므로 계속 사용하려면 이메일 연동을 해두는 게 안전합니다.
            </div>
          )}
        </section>

        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600 md:text-xs">
          <span>총 {clips.length}개</span>
          {urgentCount > 0 && (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-600">마감임박 {urgentCount}개</span>
          )}
        </div>

        <ErrorMessage message={errorMessage} className="mb-4" />

        <Card className="flex min-h-105 flex-1 flex-col md:min-h-130">
          {clips.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-4 text-center md:p-6">
              {hasActiveFilters() ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-700">조건에 맞는 공고가 없어요.</p>
                    <p className="mt-2 text-sm text-slate-500">검색어를 바꾸거나 필터를 초기화해보세요.</p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-4 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700"
                    >
                      필터 초기화
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 md:text-base">아직 저장한 공고가 없어요.</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500 md:text-sm">
                      처음 본 오디션 공고를 바로 저장해보세요. 마감일과 지원 상태를 한곳에서 관리할 수 있어요.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/clips/new')}
                      className="mt-3 rounded-xl bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                      첫 공고 추가하기
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {clips.map((clip) => (
                <article
                  key={clip.id}
                  onClick={() => navigate(`/clips/${clip.id}`)}
                  className="cursor-pointer rounded-2xl border border-slate-200 p-4 transition hover:border-violet-300 hover:bg-violet-50/30"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {getSourceLabel(clip.sourceCode)}
                        </span>
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                          {getStatusLabel(clip.statusCode)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900">{clip.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">마감일: {clip.deadlineDate || '-'}</p>

                      {clip.memo && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{clip.memo}</p>}
                    </div>

                    <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-left md:text-right">
                      <p className="text-xs text-slate-500">마감</p>
                      <p className="text-sm font-semibold text-slate-900">{getDaysLeftText(clip.daysLeft)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

export default ClipListPage
