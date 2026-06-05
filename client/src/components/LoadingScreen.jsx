function LoadingScreen({
  message = '불러오는 중...',
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">{message}</p>
    </main>
  )
}

export default LoadingScreen