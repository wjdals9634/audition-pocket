function BackButton({
  onClick,
  children = '← 목록으로 돌아가기',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-slate-500 hover:text-slate-900"
    >
      {children}
    </button>
  )
}

export default BackButton