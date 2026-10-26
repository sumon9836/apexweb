'use client'

import { Cloud, ImagePlay, Plus, QrCode, ShieldCheck, Sparkles, Users, Zap, type LucideIcon } from 'lucide-react'
import { config } from '@/lib/config'

const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  qr: QrCode,
  users: Users,
  image: ImagePlay,
  cloud: Cloud,
  shield: ShieldCheck,
}

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="reveal mx-auto max-w-xl text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-pretty text-muted-foreground">{text}</p>}
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-5xl px-4 pt-24">
      <SectionHead eyebrow="Features" title="Everything your chats need." text="A compact bot with the tools people actually use every day." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {config.features.map((f, i) => {
          const Icon = ICONS[f.icon] ?? Sparkles
          return (
            <article
              key={f.title}
              className="glass reveal group rounded-[1.75rem] p-6 transition-transform duration-300 hover:-translate-y-1"
              style={{ '--d': `${(i % 3) * 0.08}s` } as React.CSSProperties}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-300 text-white shadow-lg shadow-sky-400/30 transition group-hover:scale-110 group-hover:rotate-6">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-primary">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function Steps() {
  return (
    <section id="how" className="mx-auto w-full max-w-5xl px-4 pt-24">
      <SectionHead eyebrow="How it works" title="Pair your bot in four steps." text="Have WhatsApp open on the phone number you want to connect." />
      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {config.steps.map((s, i) => (
          <li
            key={s.title}
            className="glass reveal flex gap-4 rounded-[1.75rem] p-5"
            style={{ '--d': `${(i % 2) * 0.1}s` } as React.CSSProperties}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary font-mono text-base font-bold text-primary-foreground">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-bold tracking-tight text-primary">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-4 pt-24">
      <SectionHead eyebrow="FAQ" title="Questions people ask." />
      <div className="mt-10 flex flex-col gap-3">
        {config.faq.map((f) => (
          <details key={f.q} className="glass reveal group rounded-3xl px-5 open:bg-white/75">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-primary [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-100 text-primary transition-transform duration-300 group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground">
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <p className="pop pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
