import raw from '@/site.config.json'

export type Track = { title: string; url: string }
export type Feature = { icon: string; title: string; text: string }
export type ChatLine = { me: boolean; text: string }

export const config = raw

export type SiteConfig = typeof raw
