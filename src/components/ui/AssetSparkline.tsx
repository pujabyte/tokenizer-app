'use client'
import { useMemo } from 'react'
import { trendColor, type Trend } from '@/lib/format'

/**
 * Small deterministic PRNG + hash — mirrors the seeding used by the OHLC
 * route (src/app/api/investor/tokens/[id]/ohlc/route.ts) so the shape
 * language matches, but runs client-side with no fetch: a card grid of 28
 * assets can't afford 28 chart requests just to draw a sparkline.
 */
function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

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

const POINTS = 22
const W = 100
const H = 40
const PAD = 5

/**
 * A given asset id always draws the same line, and that line always drifts
 * toward the asset's real change% — up-trending for a gainer, down for a
 * loser — so the shape is a (rough) signal instead of arbitrary decoration.
 */
function useSparklineGeometry(id: string, changePct: number | null) {
  return useMemo(() => {
    const rng = makeRng(hash(`${id}:sparkline`))
    const drift = (changePct ?? 0) / 100
    const start = 1
    const end = 1 + drift
    const step = (end - start) / Math.max(POINTS - 1, 1)
    const volatility = 0.05 + Math.min(Math.abs(drift), 0.4) * 0.5

    const values: number[] = []
    for (let i = 0; i < POINTS; i++) {
      const onTrend = start + step * i
      const noise = (rng() - 0.5) * volatility
      const v = i === 0 ? start : i === POINTS - 1 ? end : Math.max(onTrend + noise, 0.05)
      values.push(v)
    }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const xOf = (i: number) => (i / (POINTS - 1)) * W
    const yOf = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2)

    let line = `M ${xOf(0).toFixed(2)} ${yOf(values[0]).toFixed(2)}`
    for (let i = 1; i < values.length; i++) {
      const x = xOf(i)
      const y = yOf(values[i])
      const prevX = xOf(i - 1)
      const prevY = yOf(values[i - 1])
      const midX = ((prevX + x) / 2).toFixed(2)
      line += ` C ${midX} ${prevY.toFixed(2)}, ${midX} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`
    }

    const area = `${line} L ${W} ${H} L 0 ${H} Z`
    const last = { x: xOf(POINTS - 1), y: yOf(values[POINTS - 1]) }
    return { line, area, last }
  }, [id, changePct])
}

/**
 * Sparkline for an asset card — no axes, no gridlines, just the shape of the
 * last session. Ends on a small live-look dot that borrows the same `pulse`
 * keyframe as the "connected" indicators elsewhere in the portal (wallet
 * pill, auth telemetry), so a glance reads as "this is moving right now".
 */
export function AssetSparkline({
  id, trend, changePct, width = 88, height = 34,
}: {
  id: string
  trend: Trend
  changePct: number | null
  width?: number
  height?: number
}) {
  const { line, area, last } = useSparklineGeometry(id, changePct)
  const color = trendColor(trend)
  const gradientId = `spark-grad-${id}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r="5" fill={color} opacity="0.16" style={{ animation: 'pulse 1.8s ease-in-out infinite' }} />
      <circle cx={last.x} cy={last.y} r="2.25" fill={color} />
    </svg>
  )
}
