'use client'

import { useEffect, useRef, useState } from 'react'
import { Disc3, Pause, Play, SkipBack, SkipForward, Volume2, X } from 'lucide-react'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'

const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

export function MusicPlayer() {
  const list = config.music.playlist
  const audioRef = useRef<HTMLAudioElement>(null)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [vol, setVol] = useState(config.music.volume)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const drag = useRef({ active: false, moved: false, dx: 0, dy: 0, sx: 0, sy: 0 })
  const shouldPlay = useRef(false)

  useEffect(() => {
    const a = audioRef.current
    if (a) a.volume = vol
  }, [vol])

  useEffect(() => {
    if (!config.music.autoplay) return
    const start = () => {
      const a = audioRef.current
      if (a && a.paused) a.play().catch(() => {})
      remove()
    }
    const evs = ['pointerdown', 'keydown', 'touchstart'] as const
    const remove = () => evs.forEach((e) => window.removeEventListener(e, start))
    evs.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }))
    return remove
  }, [])

  useEffect(() => {
    const a = audioRef.current
    if (a && shouldPlay.current) a.play().catch(() => {})
  }, [idx])

  if (!list.length) return null
  const track = list[idx]

  const go = (d: number) => {
    shouldPlay.current = true
    setIdx((i) => (i + d + list.length) % list.length)
  }

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    drag.current = { active: true, moved: false, dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d.active) return
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return
    d.moved = true
    const size = 60
    setPos({
      x: Math.min(window.innerWidth - size - 8, Math.max(8, e.clientX - d.dx)),
      y: Math.min(window.innerHeight - size - 8, Math.max(8, e.clientY - d.dy)),
    })
  }
  const onPointerUp = () => {
    const d = drag.current
    d.active = false
    if (!d.moved) setOpen((o) => !o)
  }

  const style: React.CSSProperties = pos ? { left: pos.x, top: pos.y } : { right: 18, bottom: 18 }
  const panelBelow = pos ? pos.y < 260 : false
  const panelLeftAligned = pos ? pos.x < 160 : false

  return (
    <>
      <audio
        ref={audioRef}
        src={track.url}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => go(1)}
        onError={() => list.length > 1 && shouldPlay.current && go(1)}
      />

      <div className="fixed z-[70]" style={style}>
        <div
          role="region"
          aria-label="Music player"
          className={cn(
            'glass absolute w-72 rounded-3xl p-4 transition-all duration-300',
            panelBelow ? 'top-[calc(100%+10px)]' : 'bottom-[calc(100%+10px)]',
            panelLeftAligned ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right',
            open ? 'visible scale-100 opacity-100 blur-0' : 'invisible scale-90 opacity-0 blur-md',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                Now playing · {idx + 1}/{list.length}
              </p>
              <p className="mt-1 truncate font-bold text-primary">{track.title}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close player" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/70 text-primary">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 flex h-8 items-end justify-center gap-1" aria-hidden="true">
            {Array.from({ length: 22 }).map((_, i) => (
              <span
                key={i}
                className="h-8 w-1 origin-bottom rounded-full bg-gradient-to-t from-sky-500 to-cyan-300"
                style={{
                  transform: 'scaleY(.15)',
                  animation: playing ? `eq ${0.6 + (i % 5) * 0.13}s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
                }}
              />
            ))}
          </div>

          <input
            type="range"
            aria-label="Seek"
            min={0}
            max={dur || 0}
            step={0.1}
            value={time}
            onChange={(e) => {
              const a = audioRef.current
              if (a) a.currentTime = Number(e.target.value)
            }}
            className="mt-3 w-full accent-sky-600"
          />
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>{fmt(time)}</span>
            <span>{fmt(dur)}</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3">
            <button type="button" onClick={() => go(-1)} aria-label="Previous track" className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-primary transition hover:bg-white">
              <SkipBack className="h-4 w-4" />
            </button>
            <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next track" className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-primary transition hover:bg-white">
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <label className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Volume</span>
            <input type="range" min={0} max={1} step={0.01} value={vol} onChange={(e) => setVol(Number(e.target.value))} className="w-full accent-sky-600" />
          </label>
        </div>

        <button
          type="button"
          aria-label={open ? 'Hide music player' : 'Show music player'}
          aria-expanded={open}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative grid h-[60px] w-[60px] touch-none select-none place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-sky-900/30 ring-4 ring-white/70"
        >
          {playing && <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/40" aria-hidden="true" />}
          <Disc3 className={cn('relative h-7 w-7', playing && 'spin-slow')} />
        </button>
      </div>
    </>
  )
}
