const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60'

export const btnPrimary = `${base} bg-linear-to-r from-brand to-[#8b5cf6] text-white shadow-md shadow-brand/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/40 active:translate-y-0`
export const btnGhost = `${base} border border-line bg-card text-ink hover:-translate-y-0.5 hover:border-brand hover:text-brand-dark`
export const btnDanger = `${base} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`

export const inputCls =
  'w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20'