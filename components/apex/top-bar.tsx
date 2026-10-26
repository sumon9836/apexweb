'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, CircleHelp, Headset, Layers, Link2, Menu, MessageSquareText, Workflow, X } from 'lucide-react'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import { SafeImg } from './safe-img'

type Props = {
  view: 'home' | 'pair'
  onPair: () => void
  onHome: () => void
  onSupport: () => void
}

const homeLinks = [
  { href: '#features', label: 'Features', icon: Layers },
  { href: '#how', label: 'How it works', icon: Workflow },
  { href: '#faq', label: 'FAQ', icon: CircleHelp },
  { href: '#review', label: 'Reviews & Query', icon: MessageSquareText },
]

export function TopBar({ view, onPair, onHome, onSupport }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const item =
    'flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-medium text-primary transition hover:bg-sky-100/80'

  return (
    <header ref={ref} className="sticky top-3 z-50 mx-auto w-full max-w-5xl px-4">
      <div className="glass flex items-center justify-between rounded-full py-2 pl-2 pr-2">
        <button type="button" onClick={onHome} className="flex items-center gap-3 rounded-full pr-2 text-left">
          <span className="relative">
            <SafeImg src={config.images.logo} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
            <span className="live-dot absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-live" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-primary">{config.brand.fullName}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {config.brand.tagline}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 font-mono text-[11px] font-semibold text-primary sm:flex">
            <span className="live-dot h-2 w-2 rounded-full bg-live" />
            {config.brand.version}
          </span>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <nav
        aria-label="Main"
        className={cn(
          'glass absolute right-4 top-[calc(100%+10px)] w-64 origin-top-right rounded-3xl p-2 transition-all duration-300',
          open ? 'visible scale-100 opacity-100 blur-0' : 'invisible scale-95 opacity-0 blur-sm',
        )}
      >
        {view === 'pair' ? (
          <button type="button" className={item} onClick={() => (setOpen(false), onHome())}>
            <ArrowLeft className="h-4 w-4 text-accent" /> Back to Home
          </button>
        ) : (
          homeLinks.map((l) => (
            <a key={l.href} href={l.href} className={item} onClick={() => setOpen(false)}>
              <l.icon className="h-4 w-4 text-accent" /> {l.label}
            </a>
          ))
        )}
        <div className="my-1.5 h-px bg-border" />
        {view === 'home' && (
          <button type="button" className={item} onClick={() => (setOpen(false), onPair())}>
            <Link2 className="h-4 w-4 text-accent" /> Go to Pairing Section
          </button>
        )}
        <button type="button" className={item} onClick={() => (setOpen(false), onSupport())}>
          <Headset className="h-4 w-4 text-accent" /> Bot Support
        </button>
      </nav>
    </header>
  )
}
