export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export function formatRange(startIso: string, endIso: string) {
  return `${formatTime(startIso)} to ${formatTime(endIso)}`
}

export function dateParts(iso: string) {
  const date = new Date(iso)
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('en-IN', { month: 'short' }),
  }
}