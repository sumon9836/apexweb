'use client'

import { Send } from 'lucide-react'
import { config } from '@/lib/config'

const field =
  'w-full rounded-2xl border border-white bg-white/70 px-4 py-3.5 text-sm text-primary outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:bg-white focus:ring-4 focus:ring-sky-200/70'

export function ReviewForm({ toast }: { toast: (m: string) => void }) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const query = String(fd.get('query') ?? '').trim()
    if (name && email && query) {
      toast('Thank you! Your query has been submitted.')
      e.currentTarget.reset()
    } else {
      toast('Please fill in all fields.')
    }
  }

  return (
    <section id="review" className="mx-auto w-full max-w-3xl px-4 pt-24">
      <div className="glass reveal rounded-[2rem] p-6 sm:p-8">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Feedback</p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-primary">User Review &amp; Query</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
            Have questions or feedback about {config.brand.fullName}? Drop your query below and we will get back to you.
          </p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Name
            <input name="name" required placeholder="Your full name" className={field} autoComplete="name" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Gmail / Email
            <input name="email" type="email" required placeholder="your.name@gmail.com" className={field} autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary sm:col-span-2">
            Your Query / Review
            <textarea name="query" required rows={4} placeholder="Write your message or feedback here..." className={`${field} resize-none`} />
          </label>
          <button
            type="submit"
            className="shine flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 sm:col-span-2"
          >
            Submit Query <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  )
}
