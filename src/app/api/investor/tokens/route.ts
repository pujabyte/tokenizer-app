import { NextResponse } from 'next/server'
import { ASSETS_DB, TOP_GAINERS, TRENDING, NEWLY_ADDED } from './data'

export async function GET() {
  return NextResponse.json({
    assets: ASSETS_DB,
    topGainers: TOP_GAINERS,
    trending: TRENDING,
    newlyAdded: NEWLY_ADDED,
    categories: ['All assets', 'Stock', 'RWA', 'Stablecoin', 'Utility Token']
  })
}
