'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  CircleAlert,
  Copy,
  CodeXml,
  Info,
  KeyRound,
  Loader2,
  MessageCircle,
  QrCode,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { config } from '@/lib/config'
import { callPairingApi } from '@/lib/api'
import { validatePhone } from '@/lib/phone'
import { cn } from '@/lib/utils'
import { SafeImg } from './safe-img'

type Tab = 'pairing' | 'qr'

const howTo = [
  <>Open <strong>WhatsApp</strong> on your mobile device.</>,
  <>Go to <strong>Settings</strong> or <strong>Menu</strong> and tap on <strong>Linked Devices</strong>.</>,
  <>Tap <strong>Link a Device</strong>, then select <strong>Link with phone number instead</strong>.</>,
  <>Enter the generated <strong>8-character pairing code</strong> to link your bot instantly.</>,
]

function QrPanel() {
  const [src, setSrc] = useState('')
  const [status, setStatus] = useState<'loading' | 'ok' | 'failed'>('loading')
  const retries = useRef(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current)
    setStatus('loading')
    const url = config.api.qrUrl
    setSrc(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now())
    retryTimer.current = setTimeout(() => fail(), 20000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fail = useCallback(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current)
    if (retries.current < 5) {
      retries.current++
      setStatus('loading')
      retryTimer.current = setTimeout(load, 4000)
    } else {
      setStatus('failed')
    }
  }, [load])

  useEffect(() => {
    load()
    const id = setInterval(load, config.api.qrRefreshSeconds * 1000)
    return () => {
      clearInterval(id)
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [load])

  return (
    <div className="pop flex flex-col items-center">
      <div className="relative grid aspect-square w-full max-w-[260px] place-items-center overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-inner">
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="WhatsApp QR code"
            referrerPolicy="no-referrer"
            onLoad={() => {
              if (retryTimer.current) clearTimeout(retryTimer.current)
              retries.current = 0
              setStatus('ok')
            }}
            onError={fail}
            className={cn('h-full w-full rounded-2xl object-contain transition duration-500', status === 'ok' ? 'opacity-100 blur-0' : 'opacity-0 blur-md')}
          />
        )}
        {status !== 'ok' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm font-medium text-muted-foreground">
            {status === 'loading' ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-accent" /> QR Code Loading...
              </>
            ) : (
              <>
                <CircleAlert className="h-7 w-7 text-destructive" /> QR failed.
              </>
            )}
          </div>
        )}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-0.5 animate-[scan_2.6s_ease-in-out_infinite] bg-accent/70 shadow-[0_0_12px_2px] shadow-sky-400/60" />
      </div>
      <button
        type="button"
        onClick={() => {
          retries.current = 0
          load()
        }}
        className="mt-4 flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-white"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Refresh QR
      </button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Auto-refreshes every {config.api.qrRefreshSeconds}s. Scan from WhatsApp → Linked Devices.
      </p>
    </div>
  )
}

export function PairView({ onHome, onCodeGenerated }: { onHome: () => void; onCodeGenerated: () => void }) {
  const [tab, setTab] = useState<Tab>('pairing')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [howOpen, setHowOpen] = useState(false)
  const [copyLabel, setCopyLabel] = useState('COPY CODE')
  const codeRef = useRef<HTMLDivElement>(null)

  const generate = async () => {
    const raw = phone.replace(/\s+/g, '')
    setPhone(raw)
    const r = validatePhone(raw)
    if (!r.ok) {
      setError(r.error)
      return
    }
    setError('')
    setLoading(true)
    setCode('')
    try {
      const data = await callPairingApi(r.number)
      if (!data) throw new Error('All API routes failed')
      if (data.status && data.pairingCode) {
        setCode(data.pairingCode)
        onCodeGenerated()
        setTimeout(() => codeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
      } else {
        setError(data.message || 'Failed to generate pairing code. Please check your number.')
      }
    } catch {
      setError('Failed to connect to the server. Please verify your internet connection or check API server status.')
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    if (!code) return
    let ok = false
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(code)
        ok = true
      } catch {}
    }
    if (!ok) {
      const ta = document.createElement('textarea')
      ta.value = code
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      ta.setSelectionRange(0, code.length)
      try {
        ok = document.execCommand('copy')
      } catch {}
      document.body.removeChild(ta)
    }
    setCopyLabel(ok ? 'COPIED TO CLIPBOARD!' : 'COPY FAILED - SELECT MANUALLY')
    setTimeout(() => setCopyLabel('COPY CODE'), 2000)
  }

  const title = [...config.brand.name]
  const socials = [
    { href: config.links.telegram, label: 'Telegram', icon: Send },
    { href: config.links.github, label: 'GitHub', icon: CodeXml },
    { href: config.links.chat, label: 'Chat', icon: MessageCircle },
  ]

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-12 pt-8">
      <button
        type="button"
        onClick={onHome}
        className="blur-in mb-6 flex items-center gap-2 rounded-full glass-soft px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/80"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="blur-in" style={{ '--d': '.05s' } as React.CSSProperties}>
        <h2 className="text-3xl font-extrabold tracking-tight text-primary">{config.pairPage.deckTitle}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{config.pairPage.deckText}</p>
      </div>

      <section className="glass blur-in mt-6 rounded-[2rem] p-3" style={{ '--d': '.12s' } as React.CSSProperties} aria-label="Pairing">
        <div className="relative aspect-[16/8] overflow-hidden rounded-[1.6rem]">
          <SafeImg src={config.images.pairBanner} alt={`${config.brand.name} banner`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
        </div>

        <div className="px-3 pb-4">
          <h1 className="-mt-7 relative text-center text-5xl font-extrabold tracking-tight text-primary" aria-label={config.brand.name}>
            {title.map((ch, i) => (
              <span key={i} className="char-in" style={{ animationDelay: `${0.25 + i * 0.06}s` }} aria-hidden="true">
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </h1>
          <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {config.pairPage.subtitle}
          </p>

          <div role="tablist" aria-label="Pairing method" className="relative mt-6 grid grid-cols-2 rounded-full bg-sky-100/80 p-1">
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-md transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]',
                tab === 'qr' && 'translate-x-full',
              )}
            />
            {(['pairing', 'qr'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  'relative z-10 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors',
                  tab === t ? 'text-primary-foreground' : 'text-primary',
                )}
              >
                {t === 'pairing' ? <KeyRound className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                {t === 'pairing' ? 'Pairing Code' : 'QR Scanner'}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === 'pairing' ? (
              <div className="pop">
                <label htmlFor="phone" className="sr-only">
                  WhatsApp number with country code
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  placeholder={config.pairPage.phonePlaceholder}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\s+/g, ''))
                    setError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) generate()
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'phone-error' : undefined}
                  className={cn(
                    'w-full rounded-2xl border bg-white/80 px-5 py-4 text-center font-mono text-lg tracking-wider text-primary outline-none transition placeholder:text-muted-foreground/50 focus:bg-white focus:ring-4',
                    error ? 'border-destructive/60 focus:ring-rose-100' : 'border-white focus:border-accent focus:ring-sky-200/70',
                  )}
                />
                {error && (
                  <p id="phone-error" role="alert" className="pop mt-2 flex items-start gap-1.5 text-xs font-medium text-destructive">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={generate}
                  disabled={loading}
                  className="shine mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold tracking-wider text-primary-foreground shadow-lg shadow-sky-900/20 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-80"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'CONNECTING...' : 'GET PAIRING CODE'}
                </button>

                <button
                  type="button"
                  aria-expanded={howOpen}
                  onClick={() => setHowOpen((o) => !o)}
                  className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
                >
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-accent" /> How to Use This Code
                  </span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', howOpen && 'rotate-180')} />
                </button>
                <div className={cn('grid transition-all duration-500', howOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 blur-sm')}>
                  <div className="overflow-hidden">
                    <ol className="mt-2 flex flex-col gap-3 rounded-2xl bg-white/60 p-4">
                      {howTo.map((s, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground [&_strong]:text-primary">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary font-mono text-[11px] font-bold text-primary-foreground">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {code && (
                  <div ref={codeRef} className="glass-dark pop mt-4 overflow-hidden rounded-3xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-semibold text-sky-100">
                        <span className="live-dot h-2 w-2 rounded-full bg-live" /> Code Generated
                      </span>
                      <span className="font-mono text-[10px] text-white/40">{config.brand.codeTag}</span>
                    </div>
                    <div className="mt-5 flex flex-wrap justify-center gap-1.5" aria-label={`Pairing code ${code}`}>
                      {[...code].map((ch, i) =>
                        ch === '-' ? (
                          <span key={i} className="code-box w-3 self-center text-center text-white/50" style={{ animationDelay: `${i * 0.05}s` }}>
                            -
                          </span>
                        ) : (
                          <span
                            key={i}
                            className="code-box grid h-12 w-9 place-items-center rounded-xl border border-white/15 bg-white/10 font-mono text-xl font-bold text-white backdrop-blur-md"
                            style={{ animationDelay: `${i * 0.05}s` }}
                          >
                            {ch}
                          </span>
                        ),
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={copy}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold tracking-wider text-primary transition hover:bg-sky-50"
                    >
                      <Copy className="h-4 w-4" /> {copyLabel}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <QrPanel />
            )}
          </div>
        </div>
      </section>

      <section className="glass blur-in mt-5 rounded-[2rem] p-6" style={{ '--d': '.2s' } as React.CSSProperties} aria-label="About">
        <div className="flex items-center gap-3">
          <SafeImg src={config.images.avatar} alt="" className="h-11 w-11 rounded-2xl object-cover" />
          <p className="text-lg font-bold tracking-tight text-primary">{config.brand.fullName}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{config.pairPage.miniText}</p>
        <div className="mt-4 flex gap-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {config.pairPage.badges.map((b, i) => (
            <span key={b} className="flex items-center gap-2 rounded-full bg-sky-100/70 px-3.5 py-2 text-xs font-semibold text-primary">
              {i === 0 ? <ShieldCheck className="h-4 w-4 text-accent" /> : <Server className="h-4 w-4 text-accent" />} {b}
            </span>
          ))}
        </div>
      </section>

      <a
        href={config.links.sponsorUrl}
        className="shine blur-in mt-5 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 p-4 text-white shadow-lg shadow-sky-500/30"
        style={{ '--d': '.28s' } as React.CSSProperties}
      >
        <span className="rounded-full bg-white/25 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider">SPONSORED</span>
        <span className="text-sm font-semibold">{config.pairPage.sponsorText}</span>
      </a>

      <footer className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-muted-foreground">
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} {config.brand.fullName}. All rights reserved.
        </p>
        <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-mono text-[10px] font-bold tracking-[0.2em] text-primary-foreground">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" /> {config.brand.creator}
        </span>
      </footer>
    </main>
  )
}
