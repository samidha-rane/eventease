export default function Soon({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted">This page is coming in the next step.</p>
    </div>
  )
}
