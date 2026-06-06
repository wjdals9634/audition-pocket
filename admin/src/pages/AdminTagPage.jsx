import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createAdminTag,
  deleteAdminTag,
  getAdminTags,
  updateAdminTag,
} from '../api/tagApi'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import PageShell from '../components/PageShell'

function AdminTagPage() {
  const navigate = useNavigate()

  const [tags, setTags] = useState([])
  const [name, setName] = useState('')
  const [displayOrder, setDisplayOrder] = useState('')

  const [editingTagId, setEditingTagId] = useState('')
  const [editingName, setEditingName] = useState('')
  const [editingDisplayOrder, setEditingDisplayOrder] = useState('')
  const [editingActive, setEditingActive] = useState(true)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      setLoading(true)
      setErrorMessage('')

      const tagList = await getAdminTags()

      setTags(tagList)
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '태그 목록을 불러오는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()

    if (!name.trim()) {
      setErrorMessage('태그명을 입력해주세요.')
      return
    }

    if (!displayOrder) {
      setErrorMessage('노출 순서를 입력해주세요.')
      return
    }

    const nextDisplayOrder = Number(displayOrder)

    if (Number.isNaN(nextDisplayOrder) || nextDisplayOrder < 1) {
      setErrorMessage('노출 순서는 1 이상의 숫자로 입력해주세요.')
      return
    }

    const duplicatedOrder = tags.some(
      (tag) => tag.displayOrder === nextDisplayOrder
    )

    if (duplicatedOrder) {
      setErrorMessage('이미 사용 중인 노출 순서입니다.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await createAdminTag({
        name: name.trim(),
        displayOrder: nextDisplayOrder,
        active: true,
      })

      setName('')
      setDisplayOrder('')

      await fetchTags()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '태그를 추가하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(tag) {
    setEditingTagId(tag.id)
    setEditingName(tag.name)
    setEditingDisplayOrder(String(tag.displayOrder))
    setEditingActive(tag.active)
    setErrorMessage('')
  }

  function cancelEdit() {
    setEditingTagId('')
    setEditingName('')
    setEditingDisplayOrder('')
    setEditingActive(true)
  }

  async function handleUpdate(event) {
    event.preventDefault()

    if (!editingTagId) {
      return
    }

    if (!editingName.trim()) {
      setErrorMessage('수정할 태그명을 입력해주세요.')
      return
    }

    if (!editingDisplayOrder) {
      setErrorMessage('수정할 노출 순서를 입력해주세요.')
      return
    }

    const nextDisplayOrder = Number(editingDisplayOrder)

    if (Number.isNaN(nextDisplayOrder) || nextDisplayOrder < 1) {
      setErrorMessage('노출 순서는 1 이상의 숫자로 입력해주세요.')
      return
    }

    const duplicatedOrder = tags.some(
      (tag) =>
        tag.id !== editingTagId &&
        tag.displayOrder === nextDisplayOrder
    )

    if (duplicatedOrder) {
      setErrorMessage('이미 사용 중인 노출 순서입니다.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await updateAdminTag(editingTagId, {
        name: editingName.trim(),
        displayOrder: nextDisplayOrder,
        active: editingActive,
      })

      cancelEdit()

      await fetchTags()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '태그를 수정하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(tag) {
    const confirmed = window.confirm(
      `${tag.name} 태그를 삭제할까요?\n\n삭제하면 사용자 화면에서 더 이상 사용되지 않습니다.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(tag.id)
      setErrorMessage('')

      await deleteAdminTag(tag.id)

      if (editingTagId === tag.id) {
        cancelEdit()
      }

      await fetchTags()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message || '태그를 삭제하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setDeletingId('')
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">태그 목록 불러오는 중...</p>
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

        <h1 className="text-2xl font-bold text-slate-900">태그 관리</h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          사용자 앱에서 공고를 분류할 때 사용하는 태그를 관리합니다.
          삭제된 태그는 사용자 화면에서 더 이상 사용되지 않습니다.
        </p>

        <ErrorMessage message={errorMessage} className="mt-5" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-900">태그 추가</h2>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                태그명
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="예: 독백"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                노출 순서
              </label>

              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={(event) => setDisplayOrder(event.target.value)}
                placeholder="예: 11"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? '추가 중...' : '태그 추가'}
            </button>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">태그 목록</h2>

              <p className="mt-1 text-sm text-slate-500">
                총 {tags.length}개
              </p>
            </div>

            <button
              type="button"
              onClick={fetchTags}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              새로고침
            </button>
          </div>

          <div className="space-y-3">
            {tags.map((tag) => {
              const editing = editingTagId === tag.id

              return (
                <div
                  key={tag.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  {editing ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          placeholder="태그명"
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                        />

                        <input
                          type="number"
                          min="1"
                          value={editingDisplayOrder}
                          onChange={(event) =>
                            setEditingDisplayOrder(event.target.value)
                          }
                          placeholder="노출 순서"
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                        />

                        <select
                          value={editingActive ? 'true' : 'false'}
                          onChange={(event) =>
                            setEditingActive(event.target.value === 'true')
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                        >
                          <option value="true">활성</option>
                          <option value="false">비활성</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          저장
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          취소
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(tag)}
                          disabled={deletingId === tag.id}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                        >
                          {deletingId === tag.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {tag.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          순서: {tag.displayOrder} · 상태:{' '}
                          {tag.active ? '활성' : '비활성'}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(tag)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(tag)}
                          disabled={deletingId === tag.id}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                        >
                          {deletingId === tag.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

export default AdminTagPage