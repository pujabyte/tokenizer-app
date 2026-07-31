import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '1D';
  
  // Configuration based on timeframe
  let dataPoints = 100;
  let intervalMs = 24 * 60 * 60 * 1000; // default 1 day

  switch (timeframe) {
    case '1H':
      dataPoints = 60; // 60 minutes
      intervalMs = 60 * 1000;
      break;
    case '1D':
      dataPoints = 24; // 24 hours
      intervalMs = 60 * 60 * 1000;
      break;
    case '1W':
      dataPoints = 7; // 7 days
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case '1M':
      dataPoints = 30; // 30 days
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case '6M':
      dataPoints = 26; // ~26 weeks
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case '1Y':
      dataPoints = 52; // 52 weeks
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    default:
      break;
  }

  // Generate deterministic-looking random walk based on ID
  // For mock purposes, just a random walk starting around a base price
  let currentPrice = params.id.includes('primenet') ? 0.85 : 1200; 

  const ohlcData = [];
  let currentTime = Date.now() - (dataPoints * intervalMs);

  for (let i = 0; i < dataPoints; i++) {
    const volatility = currentPrice * 0.015; // 1.5% volatility
    const change = (Math.random() - 0.48) * volatility; // slight upward bias
    
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + (Math.random() * volatility * 0.5);
    const low = Math.min(open, close) - (Math.random() * volatility * 0.5);
    
    ohlcData.push({
      time: Math.floor(currentTime / 1000), // Unix timestamp in seconds
      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(low.toFixed(4)),
      close: Number(close.toFixed(4))
    });

    currentPrice = close;
    currentTime += intervalMs;
  }

  return NextResponse.json({
    id: params.id,
    timeframe,
    data: ohlcData
  });
}
