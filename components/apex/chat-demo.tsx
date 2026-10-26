'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import { SafeImg } from './safe-img'

type Msg = { id: number; me: boolean; text: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function ChatDemo() {
  const chatRef = useRef<HTMLDivElement>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    let visible = false
    let running = false
    let cancelled = false
    let id = 0

    const run = async () => {
      if (running) return
      running = true
      while (visible && !cancelled) {
        setMsgs([])
        for (const m of config.chatDemo) {
          if (!visible || cancelled) break
          if (!m.me) {
            setTyping(true)
            await sleep(900)
            setTyping(false)
          } else {
            await sleep(700)
          }
          if (cancelled) break
          setMsgs((prev) => [...prev, { id: id++, me: m.me, text: m.text }].slice(-6))
          await sleep(m.me ? 500 : 1100)
        }
        await sleep(2200)
      }
      running = false
    }

    const io = new IntersectionObserver(
      (es) => {
        visible = es[0].isIntersecting
        if (visible) run()
      },
      { threshold: 0.25 },
    )
    if (chatRef.current) io.observe(chatRef.current)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [])

  return (
    <section id="demo" className="mx-auto w-full max-w-5xl px-4 pt-24">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="reveal">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Live demo</p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">See it work in a chat.</h2>
          <p className="mt-3 max-w-md text-pretty text-muted-foreground">
            Send a command and the bot answers in seconds. Here is a short example of what a conversation looks like.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {config.chips.map((c) => (
              <li key={c} className="glass-soft rounded-full px-4 py-2 text-sm font-medium text-primary">
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal mx-auto w-full max-w-sm" style={{ '--d': '.12s' } as React.CSSProperties}>
          <div className="glass rounded-[2.4rem] p-2.5">
            <div className="overflow-hidden rounded-[2rem] bg-[#eaf6fe]">
              <div className="flex items-center gap-3 bg-primary px-4 py-3.5 text-primary-foreground">
                <SafeImg src={config.images.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="leading-tight">
                  <p className="text-sm font-bold">{config.brand.fullName.toUpperCase()}</p>
                  <p className="text-[11px] text-sky-200">{typing ? 'typing…' : 'online'}</p>
                </div>
              </div>
              <div
                ref={chatRef}
                aria-live="polite"
                className="flex h-[22rem] flex-col justify-end gap-2 p-4"
                style={{
                  backgroundImage: 'radial-gradient(rgba(14,165,233,.12) 1px, transparent 1px)',
                  backgroundSize: '14px 14px',
                }}
              >
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'pop max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm',
                      m.me ? 'self-end rounded-br-md bg-primary text-primary-foreground' : 'self-start rounded-bl-md bg-white text-primary',
                    )}
                  >
                    {m.text}
                    {m.me && <CheckCheck className="ml-1.5 inline h-3.5 w-3.5 text-sky-300" aria-hidden="true" />}
                  </div>
                ))}
                {typing && (
                  <div className="pop flex gap-1 self-start rounded-2xl rounded-bl-md bg-white px-4 py-3" aria-label="Bot is typing">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-sky-500" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
