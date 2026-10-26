import { config } from '@/lib/config'

function fetchWithTimeout(url: string, ms: number) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { signal: ctrl.signal, cache: 'no-store' }).finally(() => clearTimeout(t))
}

export type PairingResponse = { status?: boolean; pairingCode?: string; message?: string }

export async function callPairingApi(number: string): Promise<PairingResponse | null> {
  const { pairingBase, pairingKey, corsProxies } = config.api
  const target = `${pairingBase}?key=${encodeURIComponent(pairingKey)}&number=${encodeURIComponent(number)}`
  const enc = encodeURIComponent(target)
  const routes = [target, ...corsProxies.map((p) => p.replace('{url}', enc))]

  for (const route of routes) {
    try {
      const res = await fetchWithTimeout(route, 30000)
      const text = await res.text()
      let json: unknown
      try {
        json = JSON.parse(text)
      } catch {
        continue
      }
      // Some relays wrap the reply as { contents: "..." }
      if (json && typeof (json as { contents?: unknown }).contents === 'string') {
        try {
          json = JSON.parse((json as { contents: string }).contents)
        } catch {
          continue
        }
      }
      if (json && typeof json === 'object') return json as PairingResponse
    } catch {
      // try next route
    }
  }
  return null
}

function safeGet(k: string) {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
function safeSet(k: string, v: number) {
  try {
    localStorage.setItem(k, String(v))
  } catch {}
}

export async function counter(key: string, increment: boolean): Promise<number> {
  const local = `cnt_${key}`
  try {
    const url = `https://abacus.jasoncameron.dev/${increment ? 'hit' : 'get'}/${config.api.counterNamespace}/${key}`
    const r = await fetch(url, { cache: 'no-store' })
    if (r.status === 404 && !increment) return 0
    if (!r.ok) throw new Error('counter')
    const j = await r.json()
    if (typeof j.value !== 'number') throw new Error('counter')
    safeSet(local, j.value)
    return j.value
  } catch {
    let n = Number(safeGet(local) || 0)
    if (increment) n++
    safeSet(local, n)
    return n
  }
}

export type Weather = { city: string; temp: number | null; humidity: number | null; wind: number | null; code: number | null }

export async function loadWeather(): Promise<Weather> {
  let place = config.api.fallbackCity
  try {
    const g = await (await fetch('https://get.geojs.io/v1/ip/geo.json')).json()
    if (g.latitude && g.longitude) {
      place = { name: g.city || g.region || place.name, lat: +g.latitude, lon: +g.longitude }
    }
  } catch {}
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    const c = (await (await fetch(u)).json()).current
    return {
      city: place.name,
      temp: Math.round(c.temperature_2m),
      humidity: Math.round(c.relative_humidity_2m),
      wind: Math.round(c.wind_speed_10m),
      code: c.weather_code,
    }
  } catch {
    return { city: place.name, temp: null, humidity: null, wind: null, code: null }
  }
}
