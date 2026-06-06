import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGuest, getMe } from '../api/authApi'
import { createClip } from '../api/clipApi'
import { getCommonCodes } from '../api/commonCodeApi'
import { getTags } from '../api/tagApi'
import BackButton from '../components/BackButton'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import LoadingScreen from '../components/LoadingScreen'
import PageShell from '../components/PageShell'

function ClipCreatePage() {
  const navigate = useNavigate()
  const errorRef = useRef(null)

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
        showError('공고 추가 화면을 불러오는 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [])

  function showError(message) {
    setErrorMessage(message)

    window.setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 0)
  }

  function toggleTag(tagId) {
    setSelectedTagIds((prevTagIds) => {
      if (prevTagIds.includes(tagId)) {
        return prevTagIds.filter((item) => item !== tagId)
      }

      return [...prevTagIds, tagId]
    })
  }

  function isValidUrl(value) {
    try {
      const url = new URL(value)

      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedSourceUrl = sourceUrl.trim()
    const trimmedMemo = memo.trim()

    if (!trimmedTitle) {
      showError('공고 제목을 입력해주세요.')
      return
    }

    if (!sourceCode) {
      showError('공고 출처를 선택해주세요.')
      return
    }

    if (!trimmedSourceUrl) {
      showError('공고 링크를 입력해주세요.')
      return
    }

    if (!isValidUrl(trimmedSourceUrl)) {
      showError('공고 링크는 http:// 또는 https://로 시작하는 주소여야 합니다.')
      return
    }

    if (!deadlineDate) {
      showError('마감일을 선택해주세요.')
      return
    }

    if (!statusCode) {
      showError('지원 상태를 선택해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await createClip({
        title: trimmedTitle,
        sourceCode,
        sourceUrl: trimmedSourceUrl,
        deadlineDate,
        statusCode,
        tagIds: selectedTagIds,
        memo: trimmedMemo,
      })

      navigate('/clips')
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '공고를 저장하는 중 문제가 발생했습니다.'

      showError(message)
    } finally {
      setSubmitting(false)
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

      <Card>
        <p className="mb-2 text-sm font-medium text-violet-600">
          Audition Pocket
        </p>

        <h1 className="text-2xl font-bold text-slate-900">
          새 오디션 공고 추가
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          공고 링크, 마감일, 지원 상태를 저장해두면 놓치기 쉬운 오디션
          일정을 한곳에서 관리할 수 있어요.
        </p>

        {currentUser?.accountType === 'GUEST' && (
          <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-violet-700">
            현재 게스트 상태입니다. 저장한 공고는 이 브라우저에서만 이어서
            볼 수 있어요. 이메일을 연동하면 더 안전하게 보관할 수 있습니다.
          </div>
        )}

        <div ref={errorRef}>
          <ErrorMessage message={errorMessage} className="mt-5" />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              공고 제목 <span className="text-red-500">*</span>
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 뮤지컬 주연 오디션"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
            />

            <p className="mt-2 text-xs text-slate-500">
              나중에 목록에서 바로 알아볼 수 있게 작품명이나 역할명을 함께
              적어두면 좋아요.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              공고 링크 <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
            />

            <p className="mt-2 text-xs text-slate-500">
              OTR, 필름메이커스, 인스타그램, 유튜브, 카카오톡에서 확인한
              공고 링크를 붙여넣으세요.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                출처 <span className="text-red-500">*</span>
              </label>

              <select
                value={sourceCode}
                onChange={(event) => setSourceCode(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
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
                마감일 <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                value={deadlineDate}
                onChange={(event) => setDeadlineDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
              />

              <p className="mt-2 text-xs text-slate-500">
                지난 공고도 기록용으로 저장할 수 있어요.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                지원 상태 <span className="text-red-500">*</span>
              </label>

              <select
                value={statusCode}
                onChange={(event) => setStatusCode(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
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

            {tags.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                선택 가능한 태그가 없습니다.
              </p>
            ) : (
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
            )}

            <p className="mt-2 text-xs text-slate-500">
              공고 성격에 맞는 태그를 선택하면 나중에 분류하기 쉬워요.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              메모
            </label>

            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="준비물, 지정곡, 지원 조건, 제출 서류 등을 적어두세요."
              rows={5}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 md:text-sm"
            />

            <p className="mt-2 text-xs text-slate-500">
              예: 지정곡 확인 필요, 프로필 PDF 제출, 영상 링크 필요
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/clips')}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 sm:w-auto"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
            >
              {submitting ? '저장 중...' : '공고 저장하기'}
            </button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export default ClipCreatePage