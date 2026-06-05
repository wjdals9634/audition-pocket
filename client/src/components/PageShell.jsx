function PageShell({
  maxWidth = 'max-w-5xl',
  children,
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className={`mx-auto ${maxWidth} px-4 py-8`}>
        {children}
      </section>
    </main>
  )
}

export default PageShell