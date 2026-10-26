'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  ArrowUpRight,
  BadgeCheck,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Headset,
  MapPin,
  Snowflake,
  Sun,
  Wind,
} from 'lucide-react'
import { config } from '@/lib/config'
import { counter, loadWeather } from '@/lib/api'
import { CountUp } from './count-up'
import { SafeImg } from './safe-img'

const once = { revalidateOnFocus: false, revalidateOnReconnect: false, revalidateIfStale: false }

function WeatherIcon({ code }: { code: number | null }) {
  const cls = 'h-9 w-9 text-accent'
  if (code === null) return <CloudSun className={cls} />
  if (code === 0) return <Sun className={cls} />
  if (code <= 2) return <CloudSun className={cls} />
  if (code === 3) return <Cloud className={cls} />
  if (code === 45 || code === 48) return <CloudFog className={cls} />
  if (code >= 51 && code <= 67) return <CloudRain className={cls} />
  if (code >= 71 && code <= 77) return <Snowflake className={cls} />
  if (code >= 80 && code <= 82) return <CloudRain className={cls} />
  if (code >= 95) return <CloudLightning className={cls} />
  return <CloudSun className={cls} />
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sky-200/80">Local time</p>
      <p className="mt-1 font-mono text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl" suppressHydrationWarning>
        {now ? (
          <>
            {p(now.getHours() % 12 || 12)}
            <span className="blink text-accent">:</span>
            {p(now.getMinutes())}
            <span className="blink text-accent">:</span>
            {p(now.getSeconds())}
            <small className="ml-1.5 text-sm tracking-wider text-sky-200">{now.getHours() < 12 ? 'AM' : 'PM'}</small>
          </>
        ) : (
          '--:--:--'
        )}
      </p>
      <p className="mt-1 text-sm text-sky-100/80">
        {now ? now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : '\u00A0'}
      </p>
    </div>
  )
}

export function HomeHero({ onPair, onSupport }: { onPair: () => void; onSupport: () => void }) {
  const { data: visitors } = useSWR('visitors', () => counter('visitors', true), once)
  const { data: sessions } = useSWR('sessions', () => counter('sessions', false), once)
  const { data: wx } = useSWR('weather', loadWeather, once)

  const stats = [
    { label: 'Visitors', value: visitors },
    { label: 'Sessions', value: sessions },
    { label: 'Methods', value: 2 },
  ]

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-10 sm:pt-14">
      <div className="blur-in text-center" style={{ '--d': '.05s' } as React.CSSProperties}>
        <span className="inline-flex items-center gap-2 rounded-full glass-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-sky-700">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" /> Bot online
        </span>
        <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-primary sm:text-6xl">
          {config.brand.pageTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">{config.brand.pageSubtitle}</p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-5">
        <article className="glass sheen blur-in rounded-[2rem] p-6 lg:col-span-3" style={{ '--d': '.15s' } as React.CSSProperties}>
          <div className="flex items-center gap-4">
            <div className="float relative">
              <div className="absolute -inset-1.5 rounded-[1.4rem] bg-gradient-to-br from-sky-300 to-cyan-200 opacity-70 blur-md" />
              <SafeImg src={config.images.avatar} alt={`${config.brand.fullName} avatar`} className="relative h-16 w-16 rounded-[1.2rem] object-cover ring-2 ring-white" />
            </div>
            <div className="min-w-0">
              <h2 className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-primary">
                {config.brand.fullName} <BadgeCheck className="h-5 w-5 text-accent" aria-label="Verified" />
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{config.brand.welcomeText}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white bg-white/60 px-3 py-3.5 text-center">
                <dd className="font-mono text-2xl font-bold tabular-nums text-primary">
                  <CountUp value={s.value} ms={s.label === 'Methods' ? 900 : 1300} />
                </dd>
                <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onPair}
              className="shine group flex h-13 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-sky-900/20 transition hover:-translate-y-0.5"
            >
              Connect Bot
              <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
            </button>
            <button
              type="button"
              onClick={onSupport}
              className="flex items-center justify-center gap-2 rounded-full border border-white bg-white/70 py-3.5 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white"
            >
              <Headset className="h-4 w-4 text-accent" /> Bot Support
            </button>
          </div>
        </article>

        <article
          className="glass-dark blur-in relative flex flex-col justify-between gap-6 overflow-hidden rounded-[2rem] p-6 lg:col-span-2"
          style={{ '--d': '.25s' } as React.CSSProperties}
        >
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-400/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative">
            <Clock />
          </div>
          <div className="relative flex items-end justify-between gap-4 rounded-3xl bg-white/10 p-4 backdrop-blur-md">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-sky-100">
                <MapPin className="h-3.5 w-3.5" /> {wx?.city ?? 'Locating…'}
              </p>
              <p className="mt-1 text-4xl font-bold">{wx ? (wx.temp ?? '--') + '°' : '--°'}</p>
              <div className="mt-2 flex gap-4 text-xs text-sky-100/80">
                <span className="flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5" /> {wx?.humidity ?? '--'}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5" /> {wx?.wind ?? '--'} km/h
                </span>
              </div>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/90">
              <WeatherIcon code={wx?.code ?? null} />
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
