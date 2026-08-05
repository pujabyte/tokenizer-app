import { NextResponse } from 'next/server'
import { ASSETS_DB } from '../../data'

const TIMEFRAMES: Record<string, { dataPoints: number; intervalMs: number }> = {
  '1H': { dataPoints: 60, intervalMs: 60 * 1000 },
  '1D': { dataPoints: 24, intervalMs: 60 * 60 * 1000 },
  '1W': { dataPoints: 7, intervalMs: 24 * 60 * 60 * 1000 },
  '1M': { dataPoints: 30, intervalMs: 24 * 60 * 60 * 1000 },
  '6M': { dataPoints: 26, intervalMs: 7 * 24 * 60 * 60 * 1000 },
  '1Y': { dataPoints: 52, intervalMs: 7 * 24 * 60 * 60 * 1000 },
}

/** mulberry32 — small deterministic PRNG so a given id+timeframe always
 *  produces the same series. Math.random() made the chart redraw differently
 *  on every reload and every timeframe click. */
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '1D'

    if (searchParams.get('fail') === '1') {
      return NextResponse.json({ error: 'Chart service unavailable' }, { status: 503 })
    }

    const token = ASSETS_DB.find(t => t.id === params.id)
    if (!token) {
      return NextResponse.json({ error: 'Token not found', code: 'TOKEN_NOT_FOUND' }, { status: 404 })
    }

    // Assets with no price have no chart. Return an explicit empty series so
    // the UI can show "No chart data" instead of an empty 260px box.
    if (token.priceUsd === null) {
      return NextResponse.json({
        id: params.id, timeframe, data: [], reason: 'NO_PRICE_DATA',
      })
    }

    const { dataPoints, intervalMs } = TIMEFRAMES[timeframe] ?? TIMEFRAMES['1D']
    const rng = makeRng(hash(`${params.id}:${timeframe}`))

    // Walk *backwards* from the real current price so the last close always
    // matches the price shown in the header. It used to chart ~$1,200 for
    // every asset regardless of its actual price.
    const endPrice = token.priceUsd
    const drift = (token.changePct ?? 0) / 100
    const startPrice = endPrice / (1 + drift || 1)
    const step = (endPrice - startPrice) / Math.max(dataPoints - 1, 1)

    const now = Date.now()
    const data: { time: number; open: number; high: number; low: number; close: number }[] = []
    for (let i = 0; i < dataPoints; i++) {
      const trendPrice = startPrice + step * i
      const volatility = trendPrice * 0.012
      const noise = (rng() - 0.5) * volatility
      const open = i === 0 ? startPrice : data[i - 1].close
      const close = i === dataPoints - 1 ? endPrice : Math.max(trendPrice + noise, 0.0001)
      const high = Math.max(open, close) + rng() * volatility * 0.5
      const low = Math.max(Math.min(open, close) - rng() * volatility * 0.5, 0)

      const decimals = endPrice < 1 ? 6 : endPrice < 100 ? 4 : 2
      data.push({
        time: Math.floor((now - (dataPoints - 1 - i) * intervalMs) / 1000),
        open: Number(open.toFixed(decimals)),
        high: Number(high.toFixed(decimals)),
        low: Number(low.toFixed(decimals)),
        close: Number(close.toFixed(decimals)),
      })
    }

    return NextResponse.json({ id: params.id, timeframe, currency: token.currency, data })
  } catch {
    return NextResponse.json({ error: 'Failed to load chart data' }, { status: 500 })
  }
}
