import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGuest, getMe } from '../api/authApi'
import { createClip } from '../api/clipApi'
import { getCommonCodes } from '../api/commonCodeApi'
import { getTags } from '../api/tagApi'

function ClipCreatePage() {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(null)
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

        let user

        try {
          user = await getMe()
        } catch {
          user = await createGuest()
        }

        const [clipSources, clipStatuses, tagList] = await Promise.all([
          getCommonCodes('CLIP_SOURCE'),
          getCommonCodes('CLIP_STATUS'),
          getTags(),
        ])

        setCurrentUser(user)
        setSourceCodes(clipSources)
        setStatusCodes(clipStatuses)
        setTags(tagList)

        if (clipSources.length > 0) {
          setSourceCode(clipSources[0].code)
        }

        const savedStatus = clipStatuses.find((item) => item.code === 'SAVED')
        if (savedStatus) {
          setStatusCode(savedStatus.code)
        } else if (clipStatuses.length > 0) {
          setStatusCode(clipStatuses[0].code)
        }
      } catch (error) {
        console.error(error)
        setErrorMessage('공고 추가 화면을 불러오는 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [])

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

      await createClip({
        title: title.trim(),
        sourceCode,
        sourceUrl: sourceUrl.trim(),
        deadlineDate,
        statusCode,
        tagIds: selectedTagIds,
        memo: memo.trim(),
      })

      navigate('/clips')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '공고를 저장하는 중 문제가 발생했습니다.'

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

          <h1 className="text-2xl font-bold text-slate-900">
            새 오디션 공고 추가
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            공고 링크, 마감일, 지원 상태를 저장해두면 한곳에서 관리할 수
            있어요.
          </p>

          {currentUser?.accountType === 'GUEST' && (
            <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-violet-700">
              현재 게스트 상태입니다. 저장한 공고는 이 브라우저에서만 이어서
              볼 수 있어요. 이메일을 연동하면 더 안전하게 보관할 수 있습니다.
            </div>
          )}

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
                placeholder="예: 뮤지컬 주연 오디션"
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
                placeholder="https://..."
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
                placeholder="준비물, 지정곡, 지원 조건 등을 적어두세요."
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
                {submitting ? '저장 중...' : '공고 저장하기'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/clips')}
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

export default ClipCreatePage