'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { mutate } from 'swr'
import { config } from '@/lib/config'
import { counter } from '@/lib/api'
import { cn } from '@/lib/utils'
import { EntryPopup } from './entry-popup'
import { HomeView } from './home-view'
import { IntroScreen } from './intro-screen'
import { MusicPlayer } from './music-player'
import { PairView } from './pair-view'
import { TopBar } from './top-bar'

type View = 'home' | 'pair'

export function ApexApp() {
  const [introDone, setIntroDone] = useState(!config.intro.enabled)
  const [popup, setPopup] = useState(false)
  const [view, setView] = useState<View>('home')
  const [switching, setSwitching] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((m: string) => {
    setToastMsg(m)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2600)
  }, [])

  const switchTo = useCallback((v: View, push = true) => {
    setSwitching(true)
    setTimeout(() => {
      setView(v)
      if (push && v === 'pair') history.pushState({ view: 'pair' }, '', '#pair')
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      setSwitching(false)
    }, 280)
  }, [])

  useEffect(() => {
    const onPop = () => switchTo(location.hash === '#pair' ? 'pair' : 'home', false)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [switchTo])

  useEffect(() => {
    document.body.style.overflow = !introDone || popup ? 'hidden' : ''
  }, [introDone, popup])

  const goHome = () => {
    if (view === 'home') return window.scrollTo({ top: 0, behavior: 'smooth' })
    if (history.state?.view === 'pair') history.back()
    else switchTo('home')
  }

  const support = () => {
    const url = `https://wa.me/${config.links.supportNumber}?text=${encodeURIComponent(config.links.supportText)}`
    window.open(url, '_blank', 'noopener')
  }

  const onCodeGenerated = () => {
    mutate('sessions', counter('sessions', true), { revalidate: false })
  }

  return (
    <>
      <div className="sky-bg" aria-hidden="true">
        <span className="orb o1" />
        <span className="orb o2" />
        <span className="orb o3" />
        <span className="orb o4" />
      </div>

      {!introDone && (
        <IntroScreen
          onDone={() => {
            setIntroDone(true)
            if (config.popup.enabled) setPopup(true)
          }}
        />
      )}
      {popup && <EntryPopup onClose={() => setPopup(false)} />}

      <TopBar view={view} onPair={() => switchTo('pair')} onHome={goHome} onSupport={support} />

      <div className={cn('transition-[opacity,filter,transform] duration-300', switching && 'translate-y-2 opacity-0 blur-md')}>
        {introDone &&
          (view === 'home' ? (
            <HomeView onPair={() => switchTo('pair')} onSupport={support} toast={toast} />
          ) : (
            <PairView onHome={goHome} onCodeGenerated={onCodeGenerated} />
          ))}
      </div>

      {introDone && <MusicPlayer />}

      <div
        role="status"
        aria-live="polite"
        className={cn(
          'glass-dark fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium text-white transition-all duration-300',
          toastMsg ? 'translate-y-0 opacity-100 blur-0' : 'pointer-events-none translate-y-4 opacity-0 blur-sm',
        )}
      >
        {toastMsg}
      </div>
    </>
  )
}
