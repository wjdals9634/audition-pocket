import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGuest, getMe } from '../api/authApi'
import { deleteClip, getClip } from '../api/clipApi'
import { getCommonCodes } from '../api/commonCodeApi'
import { getTags } from '../api/tagApi'
import BackButton from '../components/BackButton'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import LoadingScreen from '../components/LoadingScreen'
import PageShell from '../components/PageShell'

function ClipDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [clip, setClip] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [statusCodes, setStatusCodes] = useState([])
  const [sourceCodes, setSourceCodes] = useState([])
  const [tags, setTags] = useState([])

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
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

        const [clipDetail, clipStatuses, clipSources, tagList] =
          await Promise.all([
            getClip(id),
            getCommonCodes('CLIP_STATUS'),
            getCommonCodes('CLIP_SOURCE'),
            getTags(),
          ])

        setCurrentUser(user)
        setClip(clipDetail)
        setStatusCodes(clipStatuses)
        setSourceCodes(clipSources)
        setTags(tagList)
      } catch (error) {
        console.error(error)

        const message =
          error.response?.data?.message ||
          '공고 상세 정보를 불러오는 중 문제가 발생했습니다.'

        setErrorMessage(message)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [id])

  function getStatusLabel(code) {
    const status = statusCodes.find((item) => item.code === code)

    if (!status) {
      return code || '-'
    }

    return status.label
  }

  function getSourceLabel(code) {
    const source = sourceCodes.find((item) => item.code === code)

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

  async function handleDelete() {
    const confirmed = window.confirm(
      '정말 이 공고를 삭제할까요?\n\n삭제하면 목록에서 더 이상 보이지 않습니다.'
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)
      setErrorMessage('')

      await deleteClip(id)

      navigate('/clips')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '공고를 삭제하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <PageShell maxWidth="max-w-3xl">
      <div className="mb-6">
        <BackButton onClick={() => navigate('/clips')} />
      </div>

      <ErrorMessage message={errorMessage} className="mb-6" />

      {clip && (
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-medium text-violet-600">
                Audition Pocket
              </p>

              <h1 className="break-words text-2xl font-bold text-slate-900">
                {clip.title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                출처: {getSourceLabel(clip.sourceCode)} · 상태:{' '}
                {getStatusLabel(clip.statusCode)}
              </p>
            </div>

            <div className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left md:w-auto md:shrink-0 md:text-right">
              <p className="text-xs text-slate-500">마감</p>
              <p className="text-lg font-bold text-slate-900">
                {getDaysLeftText(clip.daysLeft)}
              </p>
            </div>
          </div>

          {currentUser?.accountType === 'GUEST' && (
            <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-violet-700">
              현재 게스트 상태입니다. 이 공고를 계속 보관하려면 이메일 연동을
              해두는 것이 안전합니다.
            </div>
          )}

          {currentUser?.accountType === 'REGISTERED' && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              로그인 계정:{' '}
              <span className="font-semibold text-slate-900">
                {currentUser.email}
              </span>
            </div>
          )}

          <div className="mt-8 space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                공고 링크
              </p>

              {clip.sourceUrl ? (
                <a
                  href={clip.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm font-medium text-violet-600 underline"
                >
                  {clip.sourceUrl}
                </a>
              ) : (
                <p className="text-sm text-slate-500">저장된 링크가 없어요.</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">출처</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {getSourceLabel(clip.sourceCode)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">지원 상태</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {getStatusLabel(clip.statusCode)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">마감일</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {clip.deadlineDate || '-'}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                태그
              </p>

              {clip.tagIds?.length === 0 ? (
                <p className="text-sm text-slate-500">선택된 태그가 없어요.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {clip.tagIds?.map((tagId) => (
                    <span
                      key={tagId}
                      className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"
                    >
                      {getTagName(tagId)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                메모
              </p>

              <div className="min-h-24 whitespace-pre-wrap rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">
                {clip.memo || '작성된 메모가 없어요.'}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(`/clips/${clip.id}/edit`)}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white sm:w-auto"
            >
              수정하기
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 disabled:opacity-50 sm:w-auto"
            >
              {deleting ? '삭제 중...' : '삭제하기'}
            </button>
          </div>
        </Card>
      )}
    </PageShell>
  )
}

export default ClipDetailPage