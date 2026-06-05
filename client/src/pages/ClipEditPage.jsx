import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGuest, getMe } from '../api/authApi'
import { getClip, updateClip } from '../api/clipApi'
import { getCommonCodes } from '../api/commonCodeApi'
import { getTags } from '../api/tagApi'

function ClipEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [sourceCodes, setSourceCodes] = useState([])
  const [statusCodes, setStatusCodes] = useState([])
  const [tags, setTags] = useState([])

  const [title, setTitle] = useState('')
  const [sourceCode, setSourceCode] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [statusCode, setStatusCode] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [memo, setMemo] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function initializePage() {
      try {
        setLoading(true)
        setErrorMessage('')

        try {
          await getMe()
        } catch {
          await createGuest()
        }

        const [clipDetail, clipSources, clipStatuses, tagList] =
          await Promise.all([
            getClip(id),
            getCommonCodes('CLIP_SOURCE'),
            getCommonCodes('CLIP_STATUS'),
            getTags(),
          ])

        setSourceCodes(clipSources)
        setStatusCodes(clipStatuses)
        setTags(tagList)

        setTitle(clipDetail.title || '')
        setSourceCode(clipDetail.sourceCode || '')
        setSourceUrl(clipDetail.sourceUrl || '')
        setDeadlineDate(clipDetail.deadlineDate || '')
        setStatusCode(clipDetail.statusCode || '')
        setSelectedTagIds(clipDetail.tagIds || [])
        setMemo(clipDetail.memo || '')
      } catch (error) {
        console.error(error)

        const message =
          error.response?.data?.message ||
          '공고 수정 화면을 불러오는 중 문제가 발생했습니다.'

        setErrorMessage(message)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [id])

  function toggleTag(tagId) {
    setSelectedTagIds((prevTagIds) => {
      if (prevTagIds.includes(tagId)) {
        return prevTagIds.filter((item) => item !== tagId)
      }

      return [...prevTagIds, tagId]
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      setErrorMessage('공고 제목을 입력해주세요.')
      return
    }

    if (!sourceCode) {
      setErrorMessage('공고 출처를 선택해주세요.')
      return
    }

    if (!sourceUrl.trim()) {
      setErrorMessage('공고 링크를 입력해주세요.')
      return
    }

    if (!deadlineDate) {
      setErrorMessage('마감일을 선택해주세요.')
      return
    }

    if (!statusCode) {
      setErrorMessage('지원 상태를 선택해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await updateClip(id, {
        title: title.trim(),
        sourceCode,
        sourceUrl: sourceUrl.trim(),
        deadlineDate,
        statusCode,
        tagIds: selectedTagIds,
        memo: memo.trim(),
      })

      navigate(`/clips/${id}`)
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '공고를 수정하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
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
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/clips/${id}`)}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            ← 상세로 돌아가기
          </button>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-violet-600">
            Audition Pocket
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
            오디션 공고 수정
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            저장해둔 오디션 공고의 상태, 마감일, 메모를 수정할 수 있어요.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                공고 제목
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                공고 링크
              </label>
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  출처
                </label>
                <select
                  value={sourceCode}
                  onChange={(event) => setSourceCode(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                >
                  {sourceCodes.map((item) => (
                    <option key={item.id} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  마감일
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(event) => setDeadlineDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  지원 상태
                </label>
                <select
                  value={statusCode}
                  onChange={(event) => setStatusCode(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                >
                  {statusCodes.map((item) => (
                    <option key={item.id} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                태그
              </label>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id)

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={
                        selected
                          ? 'rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white'
                          : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600'
                      }
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                메모
              </label>
              <textarea
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? '저장 중...' : '수정 저장하기'}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/clips/${id}`)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default ClipEditPage