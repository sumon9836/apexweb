'use client'

import { config } from '@/lib/config'
import { ChatDemo } from './chat-demo'
import { HomeHero } from './home-hero'
import { Faq, Features, Steps } from './home-sections'
import { ReviewForm } from './review-form'
import { useReveal } from './use-reveal'

type Props = { onPair: () => void; onSupport: () => void; toast: (m: string) => void }

export function HomeView({ onPair, onSupport, toast }: Props) {
  useReveal()
  return (
    <main className="pb-10">
      <HomeHero onPair={onPair} onSupport={onSupport} />
      <Features />
      <Steps />
      <ChatDemo />
      <Faq />
      <ReviewForm toast={toast} />
      <footer className="mx-auto mt-20 flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row">
        <span>
          <b className="font-bold text-primary">{config.brand.fullName}</b> — {config.brand.tagline}
        </span>
        <span suppressHydrationWarning>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}
