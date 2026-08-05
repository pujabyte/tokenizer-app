import { NextResponse } from 'next/server'
import { ASSETS_DB, CATEGORIES, TOP_GAINERS, TOP_LOSERS, TRENDING, NEWLY_ADDED } from './data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // ?fail=1 forces the error path so the UI's error state is demoable
    if (searchParams.get('fail') === '1') {
      return NextResponse.json({ error: 'Upstream market data unavailable' }, { status: 503 })
    }
    // ?empty=1 returns a valid-but-empty payload so empty states are demoable
    const empty = searchParams.get('empty') === '1'

    return NextResponse.json({
      assets: empty ? [] : ASSETS_DB,
      topGainers: empty ? [] : TOP_GAINERS,
      topLosers: empty ? [] : TOP_LOSERS,
      trending: empty ? [] : TRENDING,
      newlyAdded: empty ? [] : NEWLY_ADDED,
      // Derived from the data — the old hardcoded list omitted "Bonds",
      // orphaning 5 assets that could only be reached via "All assets".
      categories: CATEGORIES,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load market data' }, { status: 500 })
  }
}
