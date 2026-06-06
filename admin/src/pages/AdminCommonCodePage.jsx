import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createAdminCommonCode,
  deleteAdminCommonCode,
  getAdminCommonCodes,
  updateAdminCommonCode,
} from '../api/commonCodeApi'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import PageShell from '../components/PageShell'

const DEFAULT_GROUP_CODE = 'CLIP_STATUS'

function AdminCommonCodePage() {
  const navigate = useNavigate()

  const [codes, setCodes] = useState([])
  const [selectedGroupCode, setSelectedGroupCode] = useState(DEFAULT_GROUP_CODE)

  const [groupCode, setGroupCode] = useState(DEFAULT_GROUP_CODE)
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [displayOrder, setDisplayOrder] = useState('')

  const [editingCodeId, setEditingCodeId] = useState('')
  const [editingLabel, setEditingLabel] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingDisplayOrder, setEditingDisplayOrder] = useState('')
  const [editingActive, setEditingActive] = useState(true)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const groupCodes = useMemo(() => {
    const uniqueGroupCodes = codes.map((item) => item.groupCode)

    return Array.from(new Set(uniqueGroupCodes)).sort()
  }, [codes])

  const filteredCodes = useMemo(() => {
    return codes.filter((item) => item.groupCode === selectedGroupCode)
  }, [codes, selectedGroupCode])

  useEffect(() => {
    fetchCodes()
  }, [])

  async function fetchCodes() {
    try {
      setLoading(true)
      setErrorMessage('')

      const codeList = await getAdminCommonCodes()

      setCodes(codeList)

      if (codeList.length > 0) {
        const hasSelectedGroup = codeList.some(
          (item) => item.groupCode === selectedGroupCode
        )

        if (!hasSelectedGroup) {
          setSelectedGroupCode(codeList[0].groupCode)
          setGroupCode(codeList[0].groupCode)
        }
      }
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '공통 코드 목록을 불러오는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  function handleSelectedGroupChange(event) {
    const nextGroupCode = event.target.value

    setSelectedGroupCode(nextGroupCode)
    setGroupCode(nextGroupCode)
    cancelEdit()
  }

  async function handleCreate(event) {
    event.preventDefault()

    if (!groupCode.trim()) {
      setErrorMessage('그룹 코드를 입력해주세요.')
      return
    }

    if (!code.trim()) {
      setErrorMessage('코드를 입력해주세요.')
      return
    }

    if (!label.trim()) {
      setErrorMessage('라벨을 입력해주세요.')
      return
    }

    if (!displayOrder) {
      setErrorMessage('노출 순서를 입력해주세요.')
      return
    }

    const nextGroupCode = groupCode.trim()
    const nextCode = code.trim()
    const nextDisplayOrder = Number(displayOrder)

    if (Number.isNaN(nextDisplayOrder) || nextDisplayOrder < 1) {
      setErrorMessage('노출 순서는 1 이상의 숫자로 입력해주세요.')
      return
    }

    const duplicatedCode = codes.some(
      (item) =>
        item.groupCode === nextGroupCode &&
        item.code === nextCode
    )

    if (duplicatedCode) {
      setErrorMessage('이미 존재하는 공통 코드입니다.')
      return
    }

    const duplicatedOrder = codes.some(
      (item) =>
        item.groupCode === nextGroupCode &&
        item.displayOrder === nextDisplayOrder
    )

    if (duplicatedOrder) {
      setErrorMessage('같은 그룹 안에서 이미 사용 중인 노출 순서입니다.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await createAdminCommonCode({
        groupCode: nextGroupCode,
        code: nextCode,
        label: label.trim(),
        description: description.trim(),
        displayOrder: nextDisplayOrder,
        active: true,
      })

      setCode('')
      setLabel('')
      setDescription('')
      setDisplayOrder('')
      setSelectedGroupCode(nextGroupCode)

      await fetchCodes()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '공통 코드를 추가하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(commonCode) {
    setEditingCodeId(commonCode.id)
    setEditingLabel(commonCode.label)
    setEditingDescription(commonCode.description || '')
    setEditingDisplayOrder(String(commonCode.displayOrder))
    setEditingActive(commonCode.active)
    setErrorMessage('')
  }

  function cancelEdit() {
    setEditingCodeId('')
    setEditingLabel('')
    setEditingDescription('')
    setEditingDisplayOrder('')
    setEditingActive(true)
  }

  async function handleUpdate(event) {
    event.preventDefault()

    if (!editingCodeId) {
      return
    }

    if (!editingLabel.trim()) {
      setErrorMessage('수정할 라벨을 입력해주세요.')
      return
    }

    if (!editingDisplayOrder) {
      setErrorMessage('수정할 노출 순서를 입력해주세요.')
      return
    }

    const targetCode = codes.find((item) => item.id === editingCodeId)

    if (!targetCode) {
      setErrorMessage('수정할 공통 코드를 찾을 수 없습니다.')
      return
    }

    const nextDisplayOrder = Number(editingDisplayOrder)

    if (Number.isNaN(nextDisplayOrder) || nextDisplayOrder < 1) {
      setErrorMessage('노출 순서는 1 이상의 숫자로 입력해주세요.')
      return
    }

    const duplicatedOrder = codes.some(
      (item) =>
        item.id !== editingCodeId &&
        item.groupCode === targetCode.groupCode &&
        item.displayOrder === nextDisplayOrder
    )

    if (duplicatedOrder) {
      setErrorMessage('같은 그룹 안에서 이미 사용 중인 노출 순서입니다.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await updateAdminCommonCode(editingCodeId, {
        label: editingLabel.trim(),
        description: editingDescription.trim(),
        displayOrder: nextDisplayOrder,
        active: editingActive,
      })

      cancelEdit()

      await fetchCodes()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '공통 코드를 수정하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commonCode) {
    const confirmed = window.confirm(
      `[${commonCode.groupCode}] ${commonCode.label} 코드를 삭제할까요?\n\n삭제하면 사용자 화면에서 더 이상 사용되지 않습니다.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(commonCode.id)
      setErrorMessage('')

      await deleteAdminCommonCode(commonCode.id)

      if (editingCodeId === commonCode.id) {
        cancelEdit()
      }

      await fetchCodes()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '공통 코드를 삭제하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setDeletingId('')
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">공통 코드 목록 불러오는 중...</p>
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

        <h1 className="text-2xl font-bold text-slate-900">
          공통 코드 관리
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          공고 상태, 공고 출처, 사용자 상태처럼 서비스에서 반복적으로 사용하는
          선택값을 관리합니다.
        </p>

        <ErrorMessage message={errorMessage} className="mt-5" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-900">
            공통 코드 추가
          </h2>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                그룹 코드
              </label>

              <input
                value={groupCode}
                onChange={(event) => setGroupCode(event.target.value)}
                placeholder="예: CLIP_STATUS"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-violet-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                예: CLIP_STATUS, CLIP_SOURCE, USER_STATUS
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                코드
              </label>

              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="예: CALLBACK_WAITING"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-violet-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                코드는 저장 후 수정하지 않는 것을 권장합니다.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                라벨
              </label>

              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="예: 콜백 대기"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                설명
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="운영자가 이해할 수 있는 설명을 입력하세요."
                rows={3}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
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
                placeholder="예: 1"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? '추가 중...' : '공통 코드 추가'}
            </button>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                공통 코드 목록
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                전체 {codes.length}개 / 현재 그룹 {filteredCodes.length}개
              </p>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedGroupCode}
                onChange={handleSelectedGroupChange}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-violet-500"
              >
                {groupCodes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={fetchCodes}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                새로고침
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredCodes.map((commonCode) => {
              const editing = editingCodeId === commonCode.id

              return (
                <div
                  key={commonCode.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  {editing ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        그룹:{' '}
                        <span className="font-semibold text-slate-900">
                          {commonCode.groupCode}
                        </span>
                        {' / '}
                        코드:{' '}
                        <span className="font-semibold text-slate-900">
                          {commonCode.code}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          value={editingLabel}
                          onChange={(event) => setEditingLabel(event.target.value)}
                          placeholder="라벨"
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

                      <textarea
                        value={editingDescription}
                        onChange={(event) =>
                          setEditingDescription(event.target.value)
                        }
                        placeholder="설명"
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />

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
                          onClick={() => handleDelete(commonCode)}
                          disabled={deletingId === commonCode.id}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                        >
                          {deletingId === commonCode.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {commonCode.label}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          코드: {commonCode.code} · 순서:{' '}
                          {commonCode.displayOrder} · 상태:{' '}
                          {commonCode.active ? '활성' : '비활성'}
                        </p>

                        {commonCode.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {commonCode.description}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(commonCode)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(commonCode)}
                          disabled={deletingId === commonCode.id}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                        >
                          {deletingId === commonCode.id ? '삭제 중...' : '삭제'}
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

export default AdminCommonCodePage