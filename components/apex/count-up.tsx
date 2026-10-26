'use client'

import { useEffect, useRef, useState } from 'react'

export function CountUp({ value, ms = 1300 }: { value: number | undefined; ms?: number }) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (value === undefined) return
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms)
      const e = 1 - Math.pow(1 - p, 4)
      setShown(Math.round(a + (value - a) * e))
      if (p < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])

  return <>{shown.toLocaleString('en-IN')}</>
}
