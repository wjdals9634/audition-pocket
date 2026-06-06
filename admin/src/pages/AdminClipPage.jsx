import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deleteAdminClip,
  getAdminClips,
  hideAdminClip,
  unhideAdminClip,
} from '../api/clipApi'
import { getAdminCommonCodes } from '../api/commonCodeApi'
import { getAdminTags } from '../api/tagApi'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import PageShell from '../components/PageShell'

function AdminClipPage() {
  const navigate = useNavigate()

  const [clips, setClips] = useState([])
  const [commonCodes, setCommonCodes] = useState([])
  const [tags, setTags] = useState([])

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [hiddenFilter, setHiddenFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const clipStatusCodes = useMemo(() => {
    return commonCodes.filter((item) => item.groupCode === 'CLIP_STATUS')
  }, [commonCodes])

  const clipSourceCodes = useMemo(() => {
    return commonCodes.filter((item) => item.groupCode === 'CLIP_SOURCE')
  }, [commonCodes])

  const filteredClips = useMemo(() => {
    return clips.filter((clip) => {
      const searchText = [
        clip.id,
        clip.userId,
        clip.userEmail,
        clip.userName,
        clip.userAccountType,
        clip.userRole,
        clip.title,
        clip.sourceCode,
        clip.statusCode,
        clip.sourceUrl,
        clip.memo,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesKeyword = keyword.trim()
        ? searchText.includes(keyword.trim().toLowerCase())
        : true

      const matchesStatus = statusFilter
        ? clip.statusCode === statusFilter
        : true

      const matchesSource = sourceFilter
        ? clip.sourceCode === sourceFilter
        : true

      const matchesHidden =
        hiddenFilter === ''
          ? true
          : String(Boolean(clip.hidden)) === hiddenFilter

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesSource &&
        matchesHidden
      )
    })
  }, [clips, keyword, statusFilter, sourceFilter, hiddenFilter])

  useEffect(() => {
    let ignore = false

    async function loadPageData() {
      try {
        const [clipList, commonCodeList, tagList] = await Promise.all([
          getAdminClips(),
          getAdminCommonCodes(),
          getAdminTags(),
        ])

        if (ignore) {
          return
        }

        setClips(clipList)
        setCommonCodes(commonCodeList)
        setTags(tagList)
      } catch (error) {
        console.error(error)

        if (ignore) {
          return
        }

        const message =
          error.response?.data?.message ||
          '공고 목록을 불러오는 중 문제가 발생했습니다.'

        setErrorMessage(message)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadPageData()

    return () => {
      ignore = true
    }
  }, [])

  async function fetchClips() {
    try {
      setErrorMessage('')

      const clipList = await getAdminClips()

      setClips(clipList)
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '공고 목록을 새로고침하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    }
  }

  async function handleToggleHidden(clip) {
    try {
      setProcessingId(clip.id)
      setErrorMessage('')

      if (clip.hidden) {
        await unhideAdminClip(clip.id)
      } else {
        await hideAdminClip(clip.id)
      }

      await fetchClips()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '공고 숨김 상태를 변경하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setProcessingId('')
    }
  }

  async function handleDelete(clip) {
    const confirmed = window.confirm(
      `${clip.title} 공고를 삭제 처리할까요?\n\n삭제하면 사용자 화면에서 더 이상 보이지 않습니다.`
    )

    if (!confirmed) {
      return
    }

    try {
      setProcessingId(clip.id)
      setErrorMessage('')

      await deleteAdminClip(clip.id)

      await fetchClips()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '공고를 삭제 처리하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setProcessingId('')
    }
  }

  function getStatusLabel(code) {
    const status = clipStatusCodes.find((item) => item.code === code)

    if (!status) {
      return code || '-'
    }

    return status.label
  }

  function getSourceLabel(code) {
    const source = clipSourceCodes.find((item) => item.code === code)

    if (!source) {
      return code || '-'
    }

    return source.label
  }

  function getTagName(tagId) {
    const tag = tags.find((item) => item.id === tagId)

    if (!tag) {
      return tagId
    }

    return tag.name
  }

  function getAuthorTitle(clip) {
    if (clip.userEmail) {
      return clip.userEmail
    }

    if (clip.userAccountType === 'GUEST') {
      return '게스트 계정'
    }

    if (clip.userAccountType === 'UNKNOWN') {
      return '알 수 없는 사용자'
    }

    return '사용자 정보 없음'
  }

  function getAuthorName(clip) {
    if (clip.userName) {
      return clip.userName
    }

    return '-'
  }

  function getAuthorAccountType(clip) {
    if (clip.userAccountType) {
      return clip.userAccountType
    }

    if (!clip.userEmail) {
      return 'GUEST'
    }

    return '-'
  }

  function formatDateTime(value) {
    if (!value) {
      return '-'
    }

    return new Date(value).toLocaleString('ko-KR')
  }

  function getDaysLeftText(daysLeft) {
    if (daysLeft === null || daysLeft === undefined) {
      return '-'
    }

    if (daysLeft < 0) {
      return `마감 ${Math.abs(daysLeft)}일 지남`
    }

    if (daysLeft === 0) {
      return '오늘 마감'
    }

    return `D-${daysLeft}`
  }

  function getHiddenBadgeClass(hidden) {
    if (hidden) {
      return 'bg-red-50 text-red-700'
    }

    return 'bg-emerald-50 text-emerald-700'
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">공고 목록 불러오는 중...</p>
      </main>
    )
  }

  return (
    <PageShell>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          ← 대시보드로 돌아가기
        </button>
      </div>

      <Card className="mb-6">
        <p className="mb-2 text-sm font-medium text-violet-600">
          Audition Pocket Admin
        </p>

        <h1 className="text-2xl font-bold text-slate-900">공고 관리</h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          전체 사용자가 저장한 오디션 공고를 확인하고, 운영상 필요한 경우
          숨김 또는 삭제 처리할 수 있습니다.
        </p>

        <ErrorMessage message={errorMessage} className="mt-5" />
      </Card>

      <Card className="mb-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">검색과 필터</h2>

            <p className="mt-1 text-sm text-slate-500">
              전체 {clips.length}개 / 현재 조건 {filteredClips.length}개
            </p>
          </div>

          <button
            type="button"
            onClick={fetchClips}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            새로고침
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="제목, 사용자 ID, 이메일, 이름, 메모 검색"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
          >
            <option value="">상태 전체</option>
            {clipStatusCodes.map((item) => (
              <option key={item.id} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
          >
            <option value="">출처 전체</option>
            {clipSourceCodes.map((item) => (
              <option key={item.id} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={hiddenFilter}
            onChange={(event) => setHiddenFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
          >
            <option value="">숨김 전체</option>
            <option value="false">노출</option>
            <option value="true">숨김</option>
          </select>
        </div>
      </Card>

      <div className="space-y-3">
        {filteredClips.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              조건에 맞는 공고가 없습니다.
            </p>
          </Card>
        ) : (
          filteredClips.map((clip) => (
            <Card key={clip.id}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {clip.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getHiddenBadgeClass(
                        clip.hidden
                      )}`}
                    >
                      {clip.hidden ? '숨김' : '노출'}
                    </span>

                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      {getDaysLeftText(clip.daysLeft)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    출처: {getSourceLabel(clip.sourceCode)} · 상태:{' '}
                    {getStatusLabel(clip.statusCode)} · 마감일:{' '}
                    {clip.deadlineDate || '-'}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    공고 ID: {clip.id}
                  </p>

                  <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                    <p className="break-all">
                      작성자:{' '}
                      <span className="font-semibold text-slate-900">
                        {getAuthorTitle(clip)}
                      </span>
                    </p>

                    <p className="mt-1">
                      이름:{' '}
                      <span className="font-semibold text-slate-900">
                        {getAuthorName(clip)}
                      </span>
                      {' · '}
                      계정 타입:{' '}
                      <span className="font-semibold text-slate-900">
                        {getAuthorAccountType(clip)}
                      </span>
                      {' · '}
                      권한:{' '}
                      <span className="font-semibold text-slate-900">
                        {clip.userRole || '-'}
                      </span>
                    </p>

                    <p className="mt-1 break-all">
                      사용자 ID: {clip.userId || '-'}
                    </p>
                  </div>

                  {clip.sourceUrl && (
                    <a
                      href={clip.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-sm font-medium text-violet-600 underline"
                    >
                      {clip.sourceUrl}
                    </a>
                  )}

                  {clip.tagIds?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {clip.tagIds.map((tagId) => (
                        <span
                          key={tagId}
                          className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"
                        >
                          {getTagName(tagId)}
                        </span>
                      ))}
                    </div>
                  )}

                  {clip.memo && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {clip.memo}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-slate-400">
                    생성일: {formatDateTime(clip.createdAt)} · 수정일:{' '}
                    {formatDateTime(clip.updatedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleHidden(clip)}
                    disabled={processingId === clip.id}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    {clip.hidden ? '숨김 해제' : '숨김'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(clip)}
                    disabled={processingId === clip.id}
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                  >
                    {processingId === clip.id ? '처리 중...' : '삭제'}
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageShell>
  )
}

export default AdminClipPage