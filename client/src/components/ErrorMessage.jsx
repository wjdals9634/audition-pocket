function ErrorMessage({
  message,
  className = '',
}) {
  if (!message) {
    return null
  }

  return (
    <div className={`rounded-2xl bg-red-50 p-4 text-sm text-red-600 ${className}`}>
      {message}
    </div>
  )
}

export default ErrorMessage