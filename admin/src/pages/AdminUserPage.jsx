import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from '../api/userApi'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import PageShell from '../components/PageShell'

function AdminUserPage() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const [editingUserId, setEditingUserId] = useState('')
  const [editingName, setEditingName] = useState('')
  const [editingStatusCode, setEditingStatusCode] = useState('ACTIVE')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const resolvedAccountType = resolveAccountType(user)

      const searchText = [
        user.id,
        user.email,
        user.name,
        user.statusCode,
        resolvedAccountType,
        user.role,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesKeyword = keyword.trim()
        ? searchText.includes(keyword.trim().toLowerCase())
        : true

      const matchesStatus = statusFilter
        ? user.statusCode === statusFilter
        : true

      const matchesAccountType = accountTypeFilter
        ? resolvedAccountType === accountTypeFilter
        : true

      const matchesRole = roleFilter
        ? user.role === roleFilter
        : true

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesAccountType &&
        matchesRole
      )
    })
  }, [users, keyword, statusFilter, accountTypeFilter, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      setErrorMessage('')

      const userList = await getAdminUsers()

      setUsers(userList)
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '사용자 목록을 불러오는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()

    if (!email.trim()) {
      setErrorMessage('이메일을 입력해주세요.')
      return
    }

    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('비밀번호는 8자 이상 입력해주세요.')
      return
    }

    if (!name.trim()) {
      setErrorMessage('이름을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await createAdminUser({
        email: email.trim(),
        password,
        name: name.trim(),
      })

      setEmail('')
      setPassword('')
      setName('')

      await fetchUsers()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '사용자를 생성하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(user) {
    setEditingUserId(user.id)
    setEditingName(user.name || '')
    setEditingStatusCode(user.statusCode || 'ACTIVE')
    setErrorMessage('')
  }

  function cancelEdit() {
    setEditingUserId('')
    setEditingName('')
    setEditingStatusCode('ACTIVE')
  }

  async function handleUpdate(event) {
    event.preventDefault()

    if (!editingUserId) {
      return
    }

    if (!editingName.trim()) {
      setErrorMessage('수정할 이름을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      await updateAdminUser(editingUserId, {
        name: editingName.trim(),
        statusCode: editingStatusCode,
      })

      cancelEdit()

      await fetchUsers()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '사용자 정보를 수정하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `${getUserTitle(user)} 계정을 삭제 처리할까요?\n\n삭제 처리하면 일반 목록과 로그인 대상에서 제외됩니다.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(user.id)
      setErrorMessage('')

      await deleteAdminUser(user.id)

      if (editingUserId === user.id) {
        cancelEdit()
      }

      await fetchUsers()
    } catch (error) {
      console.error(error)

      const message =
        error.response?.data?.message ||
        '사용자를 삭제 처리하는 중 문제가 발생했습니다.'

      setErrorMessage(message)
    } finally {
      setDeletingId('')
    }
  }

  function resolveAccountType(user) {
    if (user.accountType) {
      return user.accountType
    }

    if (!user.email) {
      return 'GUEST'
    }

    return '-'
  }

  function formatUserId(id) {
    if (!id) {
      return '-'
    }

    return id
  }

  function getUserTitle(user) {
    if (user.email) {
      return user.email
    }

    return `게스트 계정 (${formatUserId(user.id)})`
  }

  function formatDateTime(value) {
    if (!value) {
      return '-'
    }

    return new Date(value).toLocaleString('ko-KR')
  }

  function getStatusBadgeClass(statusCode) {
    if (statusCode === 'ACTIVE') {
      return 'bg-emerald-50 text-emerald-700'
    }

    if (statusCode === 'SUSPENDED') {
      return 'bg-amber-50 text-amber-700'
    }

    if (statusCode === 'DELETED') {
      return 'bg-red-50 text-red-700'
    }

    return 'bg-slate-50 text-slate-700'
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">사용자 목록 불러오는 중...</p>
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

        <h1 className="text-2xl font-bold text-slate-900">사용자 관리</h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          게스트 사용자, 이메일 회원, 관리자 계정의 상태를 확인하고 운영상
          필요한 사용자 상태를 관리합니다.
        </p>

        <ErrorMessage message={errorMessage} className="mt-5" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-900">사용자 생성</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            운영자가 직접 이메일 회원을 생성합니다. 생성된 사용자는 기본적으로
            USER 권한과 REGISTERED 계정 타입을 갖습니다.
          </p>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                이메일
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                비밀번호
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="8자 이상"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                이름
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="사용자 이름"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? '생성 중...' : '사용자 생성'}
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  사용자 목록
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  전체 {users.length}명 / 현재 조건 {filteredUsers.length}명
                </p>
              </div>

              <button
                type="button"
                onClick={fetchUsers}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                새로고침
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="이메일, 이름, ID 검색"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 md:col-span-1"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
              >
                <option value="">상태 전체</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="DELETED">DELETED</option>
              </select>

              <select
                value={accountTypeFilter}
                onChange={(event) => setAccountTypeFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
              >
                <option value="">계정 타입 전체</option>
                <option value="GUEST">GUEST</option>
                <option value="REGISTERED">REGISTERED</option>
              </select>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
              >
                <option value="">권한 전체</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </Card>

          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500">
                  조건에 맞는 사용자가 없습니다.
                </p>
              </Card>
            ) : (
              filteredUsers.map((user) => {
                const editing = editingUserId === user.id
                const resolvedAccountType = resolveAccountType(user)

                return (
                  <Card key={user.id}>
                    {editing ? (
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                          계정:{' '}
                          <span className="font-semibold text-slate-900">
                            {getUserTitle(user)}
                          </span>
                          {' / '}
                          계정 타입:{' '}
                          <span className="font-semibold text-slate-900">
                            {resolvedAccountType}
                          </span>
                          {' / '}
                          권한:{' '}
                          <span className="font-semibold text-slate-900">
                            {user.role || '-'}
                          </span>

                          <p className="mt-2 break-all text-xs text-slate-500">
                            사용자 ID: {formatUserId(user.id)}
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            value={editingName}
                            onChange={(event) =>
                              setEditingName(event.target.value)
                            }
                            placeholder="이름"
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                          />

                          <select
                            value={editingStatusCode}
                            onChange={(event) =>
                              setEditingStatusCode(event.target.value)
                            }
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                            <option value="DELETED">DELETED</option>
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
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user.id}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                          >
                            {deletingId === user.id ? '삭제 중...' : '삭제'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {getUserTitle(user)}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                user.statusCode
                              )}`}
                            >
                              {user.statusCode || '-'}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-600">
                            이름: {user.name || '-'}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            계정 타입: {resolvedAccountType} · 권한:{' '}
                            {user.role || '-'}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            사용자 ID: {formatUserId(user.id)}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            생성일: {formatDateTime(user.createdAt)} · 최근 로그인:{' '}
                            {formatDateTime(user.lastLoginAt)}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user.id}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                          >
                            {deletingId === user.id ? '삭제 중...' : '삭제'}
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

export default AdminUserPage