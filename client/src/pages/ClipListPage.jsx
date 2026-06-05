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
          getClips({
            sort: 'RECENT',
          }),
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

    if (!status) {
      return code
    }

    return status.label
  }

  function getSourceLabel(code) {
    const source = sourceCodes.find((item) => item.code === code)

    if (!source) {
      return code
    }

    return source.label
  }

  async function fetchClipsWithFilters(nextValues = {}) {
    const nextKeyword =
      nextValues.keyword !== undefined ? nextValues.keyword : keyword
    const nextStatusCode =
      nextValues.statusCode !== undefined ? nextValues.statusCode : statusCode
    const nextSourceCode =
      nextValues.sourceCode !== undefined ? nextValues.sourceCode : sourceCode
    const nextSort = nextValues.sort !== undefined ? nextValues.sort : sort

    try {
      setFiltering(true)
      setErrorMessage('')

      const params = {
        sort: nextSort,
      }

      if (nextKeyword.trim()) {
        params.keyword = nextKeyword.trim()
      }

      if (nextStatusCode) {
        params.statusCode = nextStatusCode
      }

      if (nextSourceCode) {
        params.sourceCode = nextSourceCode
      }

      const clipList = await getClips(params)

      setClips(clipList)
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '공고 목록을 불러오는 중 문제가 발생했습니다.'

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

    fetchClipsWithFilters({
      keyword,
    })
  }

  function handleStatusChange(event) {
    const value = event.target.value

    setStatusCode(value)

    fetchClipsWithFilters({
      statusCode: value,
    })
  }

  function handleSourceChange(event) {
    const value = event.target.value

    setSourceCode(value)

    fetchClipsWithFilters({
      sourceCode: value,
    })
  }

  function handleSortChange(event) {
    const value = event.target.value

    setSort(value)

    fetchClipsWithFilters({
      sort: value,
    })
  }

  function handleResetFilters() {
    setKeyword('')
    setStatusCode('')
    setSourceCode('')
    setSort('RECENT')

    fetchClipsWithFilters({
      keyword: '',
      statusCode: '',
      sourceCode: '',
      sort: 'RECENT',
    })
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

      const message =
        error.response?.data?.message || '로그아웃 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <PageShell maxWidth="max-w-5xl">
      <Card className="mb-8">
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
      </Card>

      <ErrorMessage message={errorMessage} className="mb-6" />

      <Card className="mb-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">검색과 필터</h2>

            <p className="mt-1 text-sm text-slate-500">
              제목, 메모, 상태, 출처, 마감일 기준으로 공고를 정리할 수 있어요.
            </p>
          </div>

          {filtering && (
            <span className="shrink-0 text-sm text-slate-500">
              적용 중...
            </span>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={keyword}
              onChange={handleKeywordChange}
              placeholder="뮤지컬, 영화, 지정곡, 프로필 등 검색"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
            />

            <button
              type="submit"
              disabled={filtering}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              검색
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={statusCode}
              onChange={handleStatusChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
            >
              <option value="">상태 전체</option>
              {statusCodes.map((item) => (
                <option key={item.id} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={sourceCode}
              onChange={handleSourceChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
            >
              <option value="">출처 전체</option>
              {sourceCodes.map((item) => (
                <option key={item.id} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={handleSortChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
            >
              <option value="RECENT">최근 저장순</option>
              <option value="DEADLINE_ASC">마감일 빠른순</option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={filtering}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              초기화
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">내 오디션 공고</h2>

          <span className="text-sm text-slate-500">총 {clips.length}개</span>
        </div>

        {clips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              조건에 맞는 공고가 없어요.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              검색어를 바꾸거나 필터를 초기화해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clips.map((clip) => (
              <article
                key={clip.id}
                onClick={() => navigate(`/clips/${clip.id}`)}
                className="cursor-pointer rounded-2xl border border-slate-200 p-4 transition hover:border-violet-300 hover:bg-violet-50/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {clip.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      출처: {getSourceLabel(clip.sourceCode)} · 상태:{' '}
                      {getStatusLabel(clip.statusCode)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      마감일: {clip.deadlineDate}
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
      </Card>
    </PageShell>
  )
}

export default ClipListPage