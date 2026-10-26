'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck, Radio, X } from 'lucide-react'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import { SafeImg } from './safe-img'

export function EntryPopup({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false)

  const close = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, 800)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[90] flex items-center justify-center bg-sky-100/40 p-5 backdrop-blur-xl transition-opacity duration-700',
        closing && 'opacity-0',
      )}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className={cn('glass relative w-full max-w-sm overflow-hidden rounded-[2rem] p-3 blur-in', closing && 'fog-out')}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close popup"
          className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/70 text-primary backdrop-blur-md transition hover:rotate-90 hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem]">
          <SafeImg src={config.images.popupBanner} alt="" className="h-full w-full scale-105 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/85 py-1 pl-1 pr-3 backdrop-blur-md">
            <SafeImg src={config.images.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
            <span className="text-xs font-semibold text-primary">{config.brand.fullName}</span>
            <BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />
          </div>
        </div>

        <div className="px-3 pb-3 pt-5 text-center">
          <h2 id="popup-title" className="text-2xl font-extrabold tracking-tight text-primary text-balance">
            {config.popup.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">{config.popup.text}</p>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={close}
              className="h-12 rounded-full border border-border bg-white/70 text-sm font-semibold text-primary transition hover:bg-white"
            >
              {config.popup.dismissLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(config.links.channelUrl, '_blank', 'noopener')
                close()
              }}
              className="shine flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Radio className="h-4 w-4" aria-hidden="true" />
              {config.popup.channelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
