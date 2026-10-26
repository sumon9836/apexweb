'use client'

import { useState } from 'react'
import { config } from '@/lib/config'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string }

export function SafeImg({ src, alt = '', ...rest }: Props) {
  const [failed, setFailed] = useState(false)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      alt={alt}
      src={failed ? config.images.fallback : src}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}
