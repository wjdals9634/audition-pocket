import { useNavigate } from 'react-router-dom'
import { logout } from '../api/authApi'
import Card from '../components/Card'
import PageShell from '../components/PageShell'

function AdminDashboardPage({
  currentUser,
  onLogout,
}) {
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    onLogout()
    navigate('/login')
  }

  return (
    <PageShell>
      <Card className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-violet-600">
              Audition Pocket Admin
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              관리자 대시보드
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              태그, 공통 코드, 사용자, 공고 데이터를 관리하는 운영 화면입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            로그아웃
          </button>
        </div>

        {currentUser && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            로그인 계정:{' '}
            <span className="font-semibold text-slate-900">
              {currentUser.email}
            </span>
            {' / '}
            권한:{' '}
            <span className="font-semibold text-slate-900">
              {currentUser.role}
            </span>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-slate-900">태그 관리</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            뮤지컬, 연극, 영화 등 오디션 분류 태그를 관리합니다.
          </p>

          <button
            type="button"
            onClick={() => navigate('/tags')}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            관리하기
          </button>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-900">공통 코드 관리</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            공고 상태, 출처, 사용자 상태 같은 서버 관리 코드를 관리합니다.
          </p>

          <button
            type="button"
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            준비 중
          </button>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-900">사용자 관리</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            가입 사용자, 게스트 사용자, 정지 상태 등을 확인합니다.
          </p>

          <button
            type="button"
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            준비 중
          </button>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-900">공고 관리</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            사용자가 저장한 공고 데이터를 운영 관점에서 확인합니다.
          </p>

          <button
            type="button"
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            준비 중
          </button>
        </Card>
      </div>
    </PageShell>
  )
}

export default AdminDashboardPage