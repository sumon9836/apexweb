'use client'

import { useEffect, useState } from 'react'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'

const SUB_FADE = 700
const LETTER_STEP = 110
const OUT_MS = 900

export function IntroScreen({ onDone }: { onDone: () => void }) {
  const title = config.brand.name
  const letters = [...title]
  const [subGone, setSubGone] = useState(false)
  const [gone, setGone] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const hold = config.intro.holdMs
    timers.push(setTimeout(() => setSubGone(true), hold))
    for (let i = 1; i <= letters.length; i++) {
      timers.push(setTimeout(() => setGone(i), hold + SUB_FADE + i * LETTER_STEP))
    }
    const end = hold + SUB_FADE + (letters.length + 1) * LETTER_STEP
    timers.push(setTimeout(() => setLeaving(true), end))
    timers.push(setTimeout(onDone, end + OUT_MS))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      role="status"
      aria-label={`${title} loading`}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#e6f5fe] transition-[opacity,filter,backdrop-filter] duration-[900ms]',
        leaving && 'pointer-events-none opacity-0 blur-xl',
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(14,165,233,.25) 2px, transparent 2.5px), radial-gradient(circle, rgba(14,165,233,.25) 2px, transparent 2.5px)',
          backgroundSize: '120px 116px',
          backgroundPosition: '0 0, 60px 58px',
          WebkitMaskImage: 'radial-gradient(ellipse 45% 35% at 50% 50%, transparent 60%, #000 100%)',
          maskImage: 'radial-gradient(ellipse 45% 35% at 50% 50%, transparent 60%, #000 100%)',
        }}
      />
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/50 blur-[90px]" />

      <div className="relative flex flex-col items-center blur-in">
        <h1 className="whitespace-nowrap text-center text-[clamp(3.2rem,14vw,10rem)] font-extrabold leading-none tracking-tight text-primary">
          {letters.map((ch, i) => {
            const fromBack = letters.length - i
            return (
              <span key={i} className={cn('intro-letter', gone >= fromBack && 'gone')}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            )
          })}
        </h1>
        <p
          className={cn(
            'mt-4 whitespace-nowrap text-center font-mono text-[clamp(0.7rem,2.4vw,1.4rem)] font-medium tracking-[0.35em] text-sky-700/70 transition-[opacity,filter] duration-700',
            subGone && 'opacity-0 blur-md',
          )}
        >
          {config.brand.introSubtitle}
        </p>
      </div>
    </div>
  )
}
