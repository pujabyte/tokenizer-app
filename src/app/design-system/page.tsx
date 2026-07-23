'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X, Star, Check, ArrowUp, DollarSign, Coins } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import FeatureBadge from '@/components/ui/FeatureBadge'
import clsx from 'clsx'

/* ── Section shell ─────────────────────────────────────────────────────── */
function Section({ id, index, title, desc, children }: { id: string; index: string; title: string; desc?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: '48px 0', borderBottom: '1px solid var(--fk-line-soft)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-.01em', display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
        <span className="fk-mono" style={{ fontSize: '13px', fontWeight: 400, color: 'var(--fk-blue-bright)' }}>{index}</span>
        {title}
      </h2>
      {desc && <p style={{ color: 'var(--fk-text-mid)', maxWidth: '680px', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>{desc}</p>}
      {children}
    </section>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: '28px 0 14px', color: 'var(--fk-text-hi)' }}>{children}</h3>
}

/* ── Swatch ────────────────────────────────────────────────────────────── */
function Swatch({ hex, name, token, use, height = 52 }: { hex: string; name: string; token?: string; use?: string; height?: number }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1000) }}
      className="text-left transition-transform hover:-translate-y-0.5"
      style={{ border: '1px solid var(--fk-line)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}
    >
      <div style={{ height: `${height}px`, background: hex }} />
      <div style={{ padding: '10px', backgroundColor: 'var(--fk-surface-1)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{name}</div>
        <div className="fk-mono" style={{ fontSize: '10.5px', color: 'var(--fk-text-low)', marginTop: '2px' }}>{copied ? 'Copied!' : (token ?? hex)}</div>
        {use && <div style={{ fontSize: '10.5px', color: 'var(--fk-text-mid)', marginTop: '3px', lineHeight: 1.4 }}>{use}</div>}
      </div>
    </button>
  )
}

function SwatchGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>{children}</div>
}

/* ── Rule callout ─────────────────────────────────────────────────────── */
function Rule({ tag, label, children }: { tag: 'do' | 'dont'; label?: string; children: React.ReactNode }) {
  return (
    <div className="fk-card" style={{ padding: '16px' }}>
      <span
        className="fk-mono"
        style={{
          display: 'inline-block', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 'var(--r-pill)', marginBottom: '8px',
          backgroundColor: tag === 'do' ? 'var(--fk-gain-tint)' : 'var(--fk-loss-tint)',
          color: tag === 'do' ? 'var(--fk-gain)' : 'var(--fk-loss)',
        }}
      >
        {label ?? (tag === 'do' ? 'Do' : "Don't")}
      </span>
      <p style={{ fontSize: '13px', color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}

function RuleGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '12px', marginTop: '20px' }}>{children}</div>
}

/* ── Order ticket (interactive) ───────────────────────────────────────── */
const OT_PRICE = 1052300
const OT_BAL = 210500000
const OT_FEE = 0.0015

function OrderTicket() {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [qty, setQty] = useState(120)
  const [activeChip, setActiveChip] = useState<number | null>(null)

  const gross = qty * OT_PRICE
  const fee = gross * OT_FEE
  const total = mode === 'buy' ? gross + fee : gross - fee
  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID')

  const onChip = (pct: number) => {
    setActiveChip(pct)
    setQty(Math.floor((OT_BAL * pct) / 100 / OT_PRICE))
  }

  return (
    <div className="fk-oticket">
      <div className="fk-ot-tabs">
        <button className={clsx('fk-ot-tab fk-buy', mode === 'buy' && 'fk-active')} onClick={() => setMode('buy')}>Beli</button>
        <button className={clsx('fk-ot-tab fk-sell', mode === 'sell' && 'fk-active')} onClick={() => setMode('sell')}>Jual</button>
      </div>
      <div className="flex items-center" style={{ gap: '12px' }}>
        <div className="fk-ac-icon" style={{ width: '34px', height: '34px', fontSize: '13px' }}>ID</div>
        <div>
          <div className="fk-ac-name" style={{ fontSize: '13.5px' }}>IDDB Bond Token</div>
          <div className="fk-ac-ticker">Rp 1.052.300 ⁄ token</div>
        </div>
      </div>
      <div className="fk-ot-amount">
        <input
          type="text"
          inputMode="numeric"
          value={qty || ''}
          placeholder="0"
          onChange={(e) => { setActiveChip(null); setQty(parseInt(e.target.value.replace(/\D/g, '')) || 0) }}
        />
      </div>
      <div className="fk-ot-conv">
        ≈ {fmt(gross)} · <span style={{ color: 'var(--fk-blue-soft)' }}>{qty.toLocaleString('id-ID')}⁄10.000</span> dari supply
      </div>
      <div className="fk-ot-chips">
        {[25, 50, 75, 100].map((pct) => (
          <button key={pct} className={clsx('fk-ot-chip', activeChip === pct && 'fk-active')} onClick={() => onChip(pct)}>
            {pct === 100 ? 'Maks' : `${pct}%`}
          </button>
        ))}
      </div>
      <div className="fk-ot-rows">
        <div className="fk-ot-row"><span>Saldo tersedia</span><span className="fk-v">Rp 210.500.000</span></div>
        <div className="fk-ot-row"><span>Biaya platform (0,15%)</span><span className="fk-v">{fmt(fee)}</span></div>
        <div className="fk-ot-row"><span>Estimasi settlement</span><span className="fk-v">2–4 menit</span></div>
        <div className="fk-ot-row" style={{ borderTop: '1px dashed var(--fk-line)', marginTop: '6px', paddingTop: '10px' }}>
          <span style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>Total</span>
          <span className="fk-v" style={{ fontWeight: 700 }}>{fmt(total)}</span>
        </div>
      </div>
      <button className={clsx('fk-btn fk-ot-cta', mode === 'buy' ? 'fk-btn-primary' : 'fk-btn-danger')}>
        {mode === 'buy' ? 'Beli' : 'Jual'} {qty.toLocaleString('id-ID')} token IDDB
      </button>
    </div>
  )
}

const NAV = [
  ['color', 'Color'], ['type', 'Typography'], ['space', 'Spacing'], ['comp', 'Components'], ['data', 'Data'], ['voice', 'Voice'], ['a11y', 'WCAG'],
]

export default function DesignSystemPage() {
  const [toggles, setToggles] = useState([true, true, false])

  const donutSlices = [
    { label: 'IDDB', color: 'var(--fk-cat-1)', pct: 42 },
    { label: 'PRMA', color: 'var(--fk-cat-2)', pct: 26 },
    { label: 'VCAP', color: 'var(--fk-cat-3)', pct: 18 },
    { label: 'BNDX', color: 'var(--fk-cat-4)', pct: 9 },
    { label: 'Lainnya', color: 'var(--fk-cat-8)', pct: 5 },
  ]
  let cursor = 25
  const dashArrays = donutSlices.map((s) => {
    const arr = { ...s, dashoffset: cursor }
    cursor -= s.pct
    return arr
  })

  return (
    <div style={{ backgroundColor: 'var(--fk-bg)', minHeight: '100vh', color: 'var(--fk-text-hi)' }}>
      {/* Nav */}
      <nav
        className="flex items-center"
        style={{
          position: 'sticky', top: 0, zIndex: 50, gap: '24px', height: '56px', padding: '0 24px',
          backgroundColor: 'rgba(10,11,16,.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--fk-line-soft)',
        }}
      >
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--fk-text-hi)' }}>
          frakta <span style={{ color: 'var(--fk-text-low)', fontWeight: 400 }}>· DS 1.4.1</span>
        </Link>
        <div className="flex items-center" style={{ gap: '4px', marginLeft: 'auto', overflowX: 'auto' }}>
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="transition-colors"
              style={{ color: 'var(--fk-text-mid)', fontSize: '12.5px', fontWeight: 500, whiteSpace: 'nowrap', padding: '6px 10px', borderRadius: 'var(--r-sm)' }}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 24px' }}>
        {/* Hero */}
        <div style={{ padding: '56px 0 40px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--fk-line-soft)' }}>
          <p className="fk-mono" style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fk-blue-bright)', marginBottom: '14px' }}>
            Frakta Design System · v1.4.1 · Dark Mode Only
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.08, marginBottom: '16px' }}>
            Own the{' '}
            <span style={{ background: 'var(--fk-grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }} className="fk-mono">1⁄1000</span>,
            <br />trust the whole.
          </h1>
          <p style={{ color: 'var(--fk-text-mid)', maxWidth: '560px', fontSize: '15px' }}>
            Design system untuk platform tokenisasi aset Frakta. Dibangun dari logomark twin-stroke: presisi institusional,
            energi electric blue, dan notasi fraksi sebagai identitas visual. Semua contoh di bawah dirender dari komponen React
            produksi — dokumentasi ini tidak akan pernah drift dari implementasi asli.
          </p>
          <div className="flex fk-mono" style={{ gap: '24px', marginTop: '28px', fontSize: '11px', color: 'var(--fk-text-low)' }}>
            <div>BASE <b style={{ color: 'var(--fk-text-hi)' }}>#0A0B10</b></div>
            <div>BRAND <b style={{ color: 'var(--fk-text-hi)' }}>#2E5CFF</b></div>
            <div>MODE <b style={{ color: 'var(--fk-text-hi)' }}>Dark only</b></div>
            <div>GRID <b style={{ color: 'var(--fk-text-hi)' }}>4pt</b></div>
          </div>
        </div>

        {/* 01 Color */}
        <Section id="color" index="01" title="Color" desc="Base near-neutral dengan hint biru sangat tipis — warna navy pekat dipindah ke momen brand (Blue Ink, Ink Wash), bukan di base. Frakta Blue satu-satunya warna brand; hijau dan merah eksklusif untuk gain/loss finansial, tidak pernah untuk dekorasi. Klik swatch untuk copy hex.">
          <SubHeading>Base &amp; Surface</SubHeading>
          <SwatchGrid>
            <Swatch hex="#0A0B10" name="Void" token="--fk-bg" use="App background" />
            <Swatch hex="#111219" name="Surface 1" token="--fk-surface-1" use="Cards, panels" />
            <Swatch hex="#1A1C24" name="Surface 2" token="--fk-surface-2" use="Nested surface, hover" />
            <Swatch hex="#22242F" name="Surface 3" token="--fk-surface-3" use="Modals, popovers" />
            <Swatch hex="#282B38" name="Line" token="--fk-line" use="Borders, dividers" />
          </SwatchGrid>

          <SubHeading>Brand — Frakta Blue</SubHeading>
          <SwatchGrid>
            <Swatch hex="#6B85FF" name="Blue Soft" token="--fk-blue-soft · v1.1" use="Selected/active state, icon tint, nav" />
            <Swatch hex="#4D75FF" name="Blue Bright" token="--fk-blue-bright" use="Links, hover, text on dark" />
            <Swatch hex="#2E5CFF" name="Frakta Blue" token="--fk-blue" use="Primary CTA, focus ring" />
            <Swatch hex="#1B3FCC" name="Blue Deep" token="--fk-blue-deep" use="Pressed state, gradient end" />
            <Swatch hex="#0E1B4D" name="Blue Ink" token="--fk-blue-ink" use="Brand-tinted surfaces" />
            <Swatch hex="linear-gradient(135deg,#4D75FF,#2E5CFF 45%,#1B3FCC)" name="Frakta Gradient" token="135° · bright→deep" use="CTA & logomark only" />
          </SwatchGrid>

          <SubHeading>Semantic</SubHeading>
          <SwatchGrid>
            <Swatch hex="#25D48A" name="Gain" token="--fk-gain" use="Kenaikan harga, sukses" />
            <Swatch hex="#FF5C6E" name="Loss" token="--fk-loss" use="Penurunan harga, error" />
            <Swatch hex="#FFC24D" name="Caution" token="--fk-warn" use="Pending, perlu perhatian" />
            <Swatch hex="#5CC8FF" name="Info" token="--fk-info" use="Informasi netral" />
          </SwatchGrid>

          <RuleGrid>
            <Rule tag="do"><b style={{ color: 'var(--fk-text-hi)' }}>Dua tingkat aksen (v1.1):</b> Frakta Blue #2E5CFF yang keras dijatah untuk CTA &amp; focus saja. <b style={{ color: 'var(--fk-text-hi)' }}>Blue Soft #6B85FF</b> untuk pemakaian sehari-hari — nav active, selected chip, icon tint.</Rule>
            <Rule tag="do"><b style={{ color: 'var(--fk-text-hi)' }}>Gradient hanya untuk CTA primer &amp; logomark.</b> Satu momen electric per screen — sisanya flat dan tenang.</Rule>
            <Rule tag="do"><b style={{ color: 'var(--fk-text-hi)' }}>Semantic tint (12% alpha)</b> untuk background badge/alert, warna solid hanya untuk teks &amp; dot.</Rule>
            <Rule tag="dont"><b style={{ color: 'var(--fk-text-hi)' }}>Jangan pakai gain/loss untuk dekorasi.</b> Hijau = naik, merah = turun. Titik.</Rule>
            <Rule tag="dont"><b style={{ color: 'var(--fk-text-hi)' }}>Jangan tumpuk gradient di atas gradient</b>, dan jangan pakai Frakta Blue solid sebagai background section besar.</Rule>
          </RuleGrid>
        </Section>

        {/* 02 Typography */}
        <Section id="type" index="02" title="Typography" desc="Tiga peran: Sora untuk display (geometrisnya nyambung dengan kurva logomark), Google Sans untuk body & UI (calm, kontras enak dengan geometri Sora), dan Google Sans Code untuk semua data finansial — harga, ticker, hash, persentase. Kalau angkanya soal uang, dia mono, tanpa pengecualian.">
          {[
            ['Display XL', 'Sora 800 · 40/1.05 · -3%', <span key="a" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '40px', lineHeight: 1.05, letterSpacing: '-.03em' }}>Tokenisasi aset riil</span>],
            ['Display M / H1', 'Sora 700 · 24/1.15 · -2%', <span key="b" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', letterSpacing: '-.02em' }}>Portofolio Anda</span>],
            ['Heading / H2', 'Sora 600 · 16/1.3', <span key="c" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '16px' }}>Aset yang tersedia</span>],
            ['Body', 'Google Sans 400 · 15/1.6', <span key="d" style={{ fontSize: '15px', color: 'var(--fk-text-mid)' }}>Setiap token mewakili kepemilikan fraksional atas aset yang tercatat on-chain dan diaudit secara berkala.</span>],
            ['Label / UI', 'Google Sans 600 · 12.5/1.4', <span key="e" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fk-text-mid)' }}>Total nilai aset</span>],
            ['Data L — harga', 'Google Sans Code 700 · 22', <span key="f" className="fk-mono" style={{ fontWeight: 700, fontSize: '22px' }}>Rp 1.284.500.000</span>],
            ['Data S — ticker/hash', 'Google Sans Code 400 · 12', <span key="g" className="fk-mono" style={{ fontSize: '12px', color: 'var(--fk-text-mid)' }}>IDDB · 0x4f2a…9c1e · +2,41% · 1⁄1000</span>],
          ].map(([label, spec, sample], i) => (
            <div key={i} className="flex items-baseline flex-wrap" style={{ gap: '20px', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', backgroundColor: 'var(--fk-surface-1)', padding: '16px 20px', marginBottom: '10px' }}>
              <div className="fk-mono" style={{ fontSize: '10.5px', color: 'var(--fk-text-low)', width: '170px', flexShrink: 0, lineHeight: 1.5 }}>
                {label}<br />{spec}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>{sample}</div>
            </div>
          ))}

          <div className="fk-frac-note" style={{ marginTop: '20px' }}>
            <span className="fk-frac-big">1<span>⁄</span>1000 · SIGNATURE</span>
            Notasi fraksi (fraction slash U+2044) adalah elemen identitas Frakta. Pakai untuk menunjukkan porsi kepemilikan di
            asset card, order ticket, dan portfolio row — selalu dalam mono, pembilang putih, slash &amp; konteks biru/muted.
          </div>
        </Section>

        {/* 03 Spacing / Elevation */}
        <Section id="space" index="03" title="Spacing, Radius &amp; Elevation" desc="Grid 4pt. Elevation di dark mode dikomunikasikan lewat kombinasi surface step + border, bukan shadow saja.">
          <div className="fk-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                {[
                  ['--s2 / --s4 / --s6', '8 / 16 / 24 px', 'Gap internal komponen, padding card'],
                  ['--s8 / --s12 / --s16', '32 / 48 / 64 px', 'Antar-blok, antar-section'],
                  ['--r-sm / md / lg', '8 / 12 / 16 px', 'Input & badge / button / card'],
                  ['--r-xl / pill', '24 / 999 px', 'Modal & hero card / chip, avatar'],
                  ['Elevation 1', 'Surface 1 + Line', 'Card default'],
                  ['Elevation 2', 'Surface 2 + shadow 4/16', 'Dropdown, hover card'],
                  ['Elevation 3', 'Surface 3 + shadow 12/40', 'Modal, dialog'],
                  ['Glow', 'Blue ring + blue shadow', 'Hanya CTA primer hover / focus'],
                ].map(([token, value, use], i) => (
                  <tr key={i}>
                    <td className="fk-mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-hi)', fontSize: '12.5px' }}>{token}</td>
                    <td className="fk-mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-mid)', fontSize: '12.5px' }}>{value}</td>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-mid)' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SubHeading>Elevation stack — live</SubHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '12px' }}>
            {[
              { t: 'Level 0 · Base', d: '#0A0B10 · no shadow', style: { backgroundColor: 'var(--fk-bg)', border: '1px dashed var(--fk-line)' } },
              { t: 'Level 1 · Card', d: 'Surface 1 + Line · shadow 1/2', style: { backgroundColor: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', boxShadow: 'var(--el-1)' } },
              { t: 'Level 2 · Floating', d: 'Surface 2 + Line · shadow 4/16', style: { backgroundColor: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', boxShadow: 'var(--el-2)' } },
              { t: 'Level 3 · Modal', d: 'Surface 3 + border terang · shadow 12/40', style: { backgroundColor: 'var(--fk-surface-3)', border: '1px solid #2C3760', boxShadow: 'var(--el-3)' } },
            ].map((d, i) => (
              <div key={i} style={{ ...d.style, borderRadius: 'var(--r-lg)', padding: '16px', minHeight: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px' }}>{d.t}</p>
                <p className="fk-mono" style={{ fontSize: '10.5px', color: 'var(--fk-text-low)', marginTop: '4px', lineHeight: 1.5 }}>{d.d}</p>
              </div>
            ))}
          </div>

          <SubHeading>Gradient recipes</SubHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '12px' }}>
            <div style={{ borderRadius: 'var(--r-lg)', minHeight: '110px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--fk-line)', background: 'var(--fk-grad)', color: '#fff' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px' }}>Core Gradient</p>
              <p className="fk-mono" style={{ fontSize: '10.5px', opacity: .8, marginTop: '4px', lineHeight: 1.5 }}>135° · CTA primer, logomark, hero card B</p>
            </div>
            <div style={{ borderRadius: 'var(--r-lg)', minHeight: '110px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--fk-line)', background: 'linear-gradient(160deg,#171921 0%,#101A40 60%,#12246A 100%)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px' }}>Ink Wash</p>
              <p className="fk-mono" style={{ fontSize: '10.5px', color: 'var(--fk-text-mid)', marginTop: '4px', lineHeight: 1.5 }}>160° · Background hero card, panel highlight</p>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)', minHeight: '110px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--fk-line)', backgroundColor: 'var(--fk-surface-1)' }}>
              <div style={{ position: 'absolute', top: '-60%', right: '-30%', width: '80%', height: '160%', background: 'radial-gradient(circle, rgba(46,92,255,.28), transparent 65%)' }} />
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', position: 'relative' }}>Radial Halo</p>
              <p className="fk-mono" style={{ fontSize: '10.5px', color: 'var(--fk-text-mid)', marginTop: '4px', lineHeight: 1.5, position: 'relative' }}>Ambient glow di corner hero / empty state</p>
            </div>
            <div className="fk-hero-c" style={{ minHeight: '110px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px' }}>Edge Light</p>
              <p className="fk-mono" style={{ fontSize: '10.5px', color: 'var(--fk-text-mid)', marginTop: '4px', lineHeight: 1.5 }}>1px border gradient · card premium tanpa fill berat</p>
            </div>
            <div style={{ borderRadius: 'var(--r-lg)', minHeight: '110px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--fk-line)', background: 'var(--fk-grad-glow)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: '#0A0B10' }}>Glow (v1.1)</p>
              <p className="fk-mono" style={{ fontSize: '10.5px', color: 'rgba(10,11,16,.75)', marginTop: '4px', lineHeight: 1.5 }}>Card promosi terang · WAJIB teks gelap</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--fk-text-low)', marginTop: '14px', lineHeight: 1.5 }}>Aturan: maksimal satu gradient &quot;berat&quot; (Core / Ink Wash) per viewport. Halo dan Edge Light ringan, boleh menemani.</p>

          <SubHeading>Glow states</SubHeading>
          <div className="flex items-center flex-wrap" style={{ gap: '28px', backgroundColor: 'var(--fk-bg)', border: '1px dashed var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <button className="fk-btn fk-btn-primary" style={{ boxShadow: 'var(--el-glow)', transform: 'translateY(-1px)' }}>Beli token</button>
              <p className="fk-mono" style={{ fontSize: '10px', color: 'var(--fk-text-low)', marginTop: '10px' }}>CTA HOVER</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <input className="fk-input fk-mono" defaultValue="120" style={{ width: '120px', textAlign: 'center', borderColor: 'var(--fk-blue)', boxShadow: '0 0 0 3px var(--fk-blue-tint)' }} />
              <p className="fk-mono" style={{ fontSize: '10px', color: 'var(--fk-text-low)', marginTop: '10px' }}>FOCUS RING</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span className="fk-badge fk-badge-brand" style={{ boxShadow: '0 0 16px rgba(46,92,255,.35)' }}><span className="fk-dot" />Featured</span>
              <p className="fk-mono" style={{ fontSize: '10px', color: 'var(--fk-text-low)', marginTop: '10px' }}>FEATURED GLOW</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--fk-gain)', boxShadow: '0 0 12px rgba(37,212,138,.7)', margin: '0 auto' }} />
              <p className="fk-mono" style={{ fontSize: '10px', color: 'var(--fk-text-low)', marginTop: '10px' }}>LIVE INDICATOR</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--fk-text-low)', marginTop: '14px' }}>Glow = perhatian. Tiga pemakaian sah: hover CTA primer, focus ring, dan indikator live/featured.</p>

          <RuleGrid>
            <Rule tag="do" label="Resep"><b style={{ color: 'var(--fk-text-hi)' }}>4 lapis per surface:</b> top-edge light, sheen gradient, border white/8%, drop shadow ganda. Warna dasar tetap dari token surface.</Rule>
            <Rule tag="do" label="Intensitas"><b style={{ color: 'var(--fk-text-hi)' }}>Banner &amp; hero pakai versi strong</b>; card biasa versi standar; elemen tenggelam (input, toggle track) pakai inner shadow — cekung, lawan dari cembung.</Rule>
            <Rule tag="dont"><b style={{ color: 'var(--fk-text-hi)' }}>Jangan tambah backdrop-blur ke semua card.</b> Blur hanya untuk elemen yang benar-benar melayang (nav sticky, modal overlay).</Rule>
          </RuleGrid>

          <SubHeading>Hero card styles</SubHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '16px' }}>
            <div className="fk-hero-a" style={{ padding: '20px', minHeight: '190px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="fk-mono" style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fk-blue-bright)', marginBottom: '10px' }}>Total Nilai Portofolio</div>
                <div className="fk-mono" style={{ fontWeight: 700, fontSize: '26px', letterSpacing: '-.01em', margin: 'auto 0 4px' }}>Rp 1.284.500.000</div>
                <div className="fk-mono" style={{ fontSize: '12px', color: 'var(--fk-text-mid)' }}><span style={{ color: 'var(--fk-gain)' }}>+Rp 28.400.000 (+2,26%)</span> · 24 jam</div>
                <div className="flex" style={{ gap: '8px', marginTop: '16px' }}>
                  <button className="fk-btn fk-btn-primary" style={{ padding: '8px 14px', fontSize: '12px' }}>Beli token</button>
                  <button className="fk-btn fk-btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}>Tarik dana</button>
                </div>
              </div>
            </div>
            <div className="fk-hero-b" style={{ padding: '20px', minHeight: '190px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="fk-mono" style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.75)', marginBottom: '10px' }}>Penawaran Perdana</div>
                <div className="fk-mono" style={{ fontWeight: 700, fontSize: '26px', letterSpacing: '-.01em', margin: 'auto 0 4px' }}>Prima Tower</div>
                <div className="fk-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,.8)' }}>Rp 485.000 ⁄ token · yield 7,2% p.a. · sisa 2.140⁄50.000</div>
                <div style={{ marginTop: '16px' }}>
                  <button className="fk-btn" style={{ background: '#fff', color: 'var(--fk-blue-deep)', padding: '8px 14px', fontSize: '12px' }}>Lihat penawaran</button>
                </div>
              </div>
            </div>
            <div className="fk-hero-c" style={{ padding: '20px', minHeight: '190px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="fk-mono" style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fk-blue-bright)', marginBottom: '10px' }}>Aset Unggulan</div>
                <div className="fk-mono" style={{ fontWeight: 700, fontSize: '26px', letterSpacing: '-.01em', margin: 'auto 0 4px' }}>IDDB</div>
                <div className="fk-mono" style={{ fontSize: '12px', color: 'var(--fk-text-mid)' }}>Rp 1.052.300 · <span style={{ color: 'var(--fk-gain)' }}>+2,41%</span> · OJK Sandbox</div>
                <div style={{ marginTop: '16px' }}>
                  <button className="fk-btn fk-btn-ghost" style={{ padding: '8px 10px', fontSize: '12px' }}>Lihat detail →</button>
                </div>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--fk-text-low)', marginTop: '14px', lineHeight: 1.6 }}>
            <b style={{ color: 'var(--fk-text-hi)' }}>A — Ink Wash + Halo</b>: default untuk hero portofolio di dashboard — dipakai langsung oleh komponen <span className="fk-mono">StatCard</span> (lihat contoh live di bawah).{' '}
            <b style={{ color: 'var(--fk-text-hi)' }}>B — Core Gradient</b>: satu momen promosi/penawaran per halaman; ghost &quot;1⁄&quot; watermark adalah signature.{' '}
            <b style={{ color: 'var(--fk-text-hi)' }}>C — Edge Light</b>: featured/premium tanpa fill berat, aman dipakai lebih dari satu.
          </p>

          <SubHeading>StatCard (komponen live — Hero Style A)</SubHeading>
          <div className="grid grid-cols-2" style={{ gap: '12px', maxWidth: '520px' }}>
            <StatCard title="Total Value Locked" value="0" icon={<DollarSign size={18} style={{ color: 'var(--fk-gain)' }} />} iconBg="var(--fk-gain-tint)" />
            <StatCard title="Total Token" value="1" icon={<Coins size={18} style={{ color: 'var(--fk-blue-soft)' }} />} iconBg="var(--fk-soft-tint)" />
          </div>
        </Section>

        {/* 04 Components */}
        <Section id="comp" index="04" title="Components">
          <SubHeading>Selected &amp; active states — Blue Soft (v1.1)</SubHeading>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ backgroundColor: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '12px' }}>
              {['Dashboard', 'Portofolio', 'Pasar', 'Riwayat'].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: '13.5px',
                    color: item === 'Portofolio' ? 'var(--fk-blue-soft)' : 'var(--fk-text-mid)',
                    backgroundColor: item === 'Portofolio' ? 'var(--fk-soft-tint)' : 'transparent',
                    fontWeight: item === 'Portofolio' ? 600 : 400,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
            <div>
              <div className="flex flex-wrap items-center" style={{ gap: '8px', marginBottom: '12px' }}>
                <span className="fk-badge" style={{ backgroundColor: 'var(--fk-soft-tint)', color: 'var(--fk-blue-soft)', border: '1px solid rgba(107,133,255,.35)' }}>Semua aset</span>
                {['Obligasi', 'Real estat', 'Basket'].map((c) => (
                  <span key={c} className="fk-badge" style={{ backgroundColor: 'transparent', color: 'var(--fk-text-mid)', border: '1px solid var(--fk-line)' }}>{c}</span>
                ))}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--fk-text-low)', maxWidth: '480px' }}>
                Nav item aktif, chip filter terpilih, tab, dan icon tint semuanya pakai <b style={{ color: 'var(--fk-blue-soft)' }}>Blue Soft + soft-tint 14%</b>.
                Frakta Blue keras tidak muncul di state ini — dia disimpan untuk CTA &amp; focus ring.
              </p>
            </div>
          </div>

          <SubHeading>Buttons</SubHeading>
          <div className="flex flex-wrap items-center" style={{ gap: '10px', marginBottom: '10px' }}>
            <button className="fk-btn fk-btn-primary">Beli token</button>
            <button className="fk-btn fk-btn-secondary">Lihat detail</button>
            <button className="fk-btn fk-btn-ghost">Pelajari dulu</button>
            <button className="fk-btn fk-btn-danger">Jual semua</button>
            <button className="fk-btn fk-btn-primary" disabled>Beli token</button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--fk-text-low)' }}>Satu primary per view. Label = kata kerja hasil aksi (&quot;Beli token&quot;, bukan &quot;Submit&quot;).</p>

          <SubHeading>Status badges</SubHeading>
          <div className="flex flex-wrap items-center" style={{ gap: '10px' }}>
            <span className="fk-badge fk-badge-gain"><span className="fk-dot" />+2,41%</span>
            <span className="fk-badge fk-badge-loss"><span className="fk-dot" />−0,87%</span>
            <span className="fk-badge fk-badge-warn"><span className="fk-dot" />Pending settlement</span>
            <span className="fk-badge fk-badge-info"><span className="fk-dot" />KYC review</span>
            <span className="fk-badge fk-badge-brand"><span className="fk-dot" />OJK Sandbox</span>
          </div>

          <SubHeading>StatusBadge &amp; FeatureBadge (komponen live)</SubHeading>
          <div className="flex flex-wrap items-center" style={{ gap: '10px', marginBottom: '10px' }}>
            <StatusBadge status="live" />
            <StatusBadge status="pending" />
            <StatusBadge status="approved" />
            <StatusBadge status="submitted" />
            <StatusBadge status="document_approved" />
          </div>
          <div className="flex flex-wrap items-center" style={{ gap: '10px' }}>
            <FeatureBadge feature="transferable" />
            <FeatureBadge feature="public" />
            <FeatureBadge feature="pausable" />
            <FeatureBadge feature="mintable" />
            <FeatureBadge feature="burnable" />
          </div>

          <SubHeading>Asset cards</SubHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '14px' }}>
            <div className="fk-asset-card">
              <div className="flex items-center" style={{ gap: '12px', marginBottom: '16px' }}>
                <div className="fk-ac-icon">ID</div>
                <div>
                  <div className="fk-ac-name">IDDB Bond Token</div>
                  <div className="fk-ac-ticker">IDDB · Obligasi</div>
                </div>
                <span className="fk-badge fk-badge-gain" style={{ marginLeft: 'auto' }}><span className="fk-dot" />+2,41%</span>
              </div>
              <div className="fk-ac-price">Rp 1.052.300</div>
              <div style={{ fontSize: '12px', color: 'var(--fk-text-low)' }}>per token · vol 24 jam Rp 3,2 M</div>
              <div className="fk-ac-frac">Anda memiliki <b>128⁄10.000</b> dari total supply</div>
            </div>
            <div className="fk-asset-card">
              <div className="flex items-center" style={{ gap: '12px', marginBottom: '16px' }}>
                <div className="fk-ac-icon" style={{ background: 'var(--fk-surface-3)', color: 'var(--fk-blue-bright)' }}>PR</div>
                <div>
                  <div className="fk-ac-name">Prima Tower Jakarta</div>
                  <div className="fk-ac-ticker">PRMA · Real estat</div>
                </div>
                <span className="fk-badge fk-badge-loss" style={{ marginLeft: 'auto' }}><span className="fk-dot" />−0,32%</span>
              </div>
              <div className="fk-ac-price">Rp 485.000</div>
              <div style={{ fontSize: '12px', color: 'var(--fk-text-low)' }}>per token · yield 7,2% p.a.</div>
              <div className="fk-ac-frac">Tersisa <b>2.140⁄50.000</b> token di penawaran ini</div>
            </div>
          </div>

          <SubHeading>Inputs</SubHeading>
          <div style={{ maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: 'var(--fk-text-mid)' }}>Jumlah token</label>
              <input className="fk-input fk-mono" defaultValue="120" />
              <p className="fk-hint">≈ Rp 126.276.000 · saldo cukup</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: 'var(--fk-text-mid)' }}>Alamat wallet tujuan</label>
              <input className="fk-input fk-mono fk-err" defaultValue="0x4f2a…INVALID" />
              <p className="fk-hint fk-err">Alamat tidak valid. Periksa kembali 42 karakter alamat tujuan.</p>
            </div>
          </div>

          <SubHeading>Alerts (tint — inline, menemani aksi user)</SubHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="fk-alert fk-alert-info"><div>ⓘ</div><p><b>Settlement berjalan</b>Order Anda diproses on-chain. Estimasi selesai 2–4 menit.</p></div>
            <div className="fk-alert fk-alert-warn"><div><AlertTriangle size={15} /></div><p><b>KYC belum selesai</b>Selesaikan verifikasi identitas untuk membeli lebih dari Rp 10 juta.</p></div>
            <div className="fk-alert fk-alert-loss"><div><X size={15} /></div><p><b>Transaksi gagal</b>Gas fee melebihi limit. Naikkan limit atau coba lagi saat jaringan lengang.</p></div>
          </div>

          <SubHeading>Order ticket (v1.4 — interaktif)</SubHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,400px))', gap: '20px' }}>
            <OrderTicket />
            <div style={{ maxWidth: '400px' }}>
              <p style={{ fontSize: '13px', color: 'var(--fk-text-mid)', lineHeight: 1.7 }}>
                Anatomi: <b style={{ color: 'var(--fk-text-hi)' }}>segmented Beli/Jual</b> pakai track cekung + tab aktif tint semantic (bukan Blue — arah transaksi adalah informasi finansial).{' '}
                <b style={{ color: 'var(--fk-text-hi)' }}>Amount input raksasa</b> mono 700/38 tanpa border, konversi rupiah + notasi fraksi live di bawahnya.{' '}
                <b style={{ color: 'var(--fk-text-hi)' }}>Quick chips</b> pakai Blue Soft selected state. Breakdown biaya selalu terlihat sebelum CTA.{' '}
                <b style={{ color: 'var(--fk-text-hi)' }}>Label CTA menyebut jumlah &amp; aset</b> — konfirmasi implisit terakhir sebelum commit.
              </p>
              <div className="fk-alert fk-alert-warn" style={{ marginTop: '16px' }}>
                <div><AlertTriangle size={15} /></div>
                <p><b>Contoh tint inline</b>Alert kondisi (KYC, saldo kurang) hidup di sini — di dalam ticket, bukan sebagai toast.</p>
              </div>
            </div>
          </div>

          <SubHeading>Grouped list &amp; toggles (v1.2)</SubHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '14px' }}>
            <div className="fk-glist">
              {[
                { icon: '◆', variant: 'blue', title: 'Profil', sub: 'Ubah nama dan username' },
                { icon: '🔑', variant: 'warn', title: 'Keamanan akun', sub: 'Kelola 2FA dan perangkat' },
                { icon: '◈', variant: 'gain', title: 'KYC & verifikasi', sub: 'Terverifikasi penuh' },
                { icon: '⏻', variant: 'loss', title: 'Keluar', sub: 'Akhiri sesi di perangkat ini' },
              ].map((row) => (
                <div key={row.title} className="fk-grow">
                  <div className={`fk-gicon fk-gi-${row.variant}`}>{row.icon}</div>
                  <div className="fk-gbody">
                    <div className="fk-gtitle">{row.title}</div>
                    <div className="fk-gsub">{row.sub}</div>
                  </div>
                  <div className="fk-gchev">›</div>
                </div>
              ))}
            </div>
            <div className="fk-glist">
              {[
                { title: 'Notifikasi harga', sub: '3 aset dipantau' },
                { title: 'Laporan bulanan', sub: 'Dikirim via email' },
                { title: 'Berita pasar', sub: 'Ketuk untuk mengaktifkan' },
              ].map((row, i) => (
                <div key={row.title} className="fk-grow">
                  <div className="fk-gicon fk-gi-blue">◆</div>
                  <div className="fk-gbody">
                    <div className="fk-gtitle">{row.title}</div>
                    <div className="fk-gsub">{toggles[i] ? row.sub : 'Ketuk untuk mengaktifkan'}</div>
                  </div>
                  <button
                    className={clsx('fk-toggle', toggles[i] && 'fk-on')}
                    role="switch"
                    aria-checked={toggles[i]}
                    aria-label={row.title}
                    onClick={() => setToggles((t) => t.map((v, idx) => (idx === i ? !v : v)))}
                  />
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--fk-text-low)', marginTop: '14px', lineHeight: 1.6 }}>
            Radius grouped list = 20px, row 14px padding vertikal, divider pakai line-soft. Toggle aktif = Blue Soft, bukan Frakta Blue.
          </p>

          <SubHeading>Filled status banners (v1.2 — sistem-level)</SubHeading>
          <p style={{ fontSize: '13px', color: 'var(--fk-text-mid)', maxWidth: '640px', marginBottom: '14px' }}>
            Dua tingkat status: satu anatomi container untuk semua status — yang membedakan hanya fill: <b style={{ color: 'var(--fk-text-hi)' }}>tint 12%</b> untuk pesan inline,{' '}
            <b style={{ color: 'var(--fk-text-hi)' }}>pekat</b> untuk toast, banner sistem, dan konfirmasi destruktif.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="fk-fbanner fk-fb-gain"><div><Check size={16} /></div><div><div className="fk-ft">Pembelian berhasil</div><div className="fk-fd">120 token IDDB masuk ke portofolio Anda.</div></div></div>
              <div className="fk-fbanner fk-fb-warn"><div><AlertTriangle size={16} /></div><div><div className="fk-ft">Sedang offline</div><div className="fk-fd">Perubahan tidak dapat disimpan sampai koneksi kembali.</div></div></div>
              <div className="fk-fbanner fk-fb-info"><div><ArrowUp size={16} /></div><div><div className="fk-ft">Pembaruan tersedia</div><div className="fk-fd">Versi terbaru Frakta membawa perbaikan settlement.</div></div></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="fk-fbanner fk-fb-loss" style={{ flexDirection: 'column' }}>
                <div className="flex" style={{ gap: '12px' }}>
                  <div><AlertTriangle size={16} /></div>
                  <div><div className="fk-ft">Jual semua token PRMA?</div><div className="fk-fd">40 token akan dijual di harga pasar. Tindakan ini tidak dapat dibatalkan setelah settlement.</div></div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', width: '100%', borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '8px' }}>
                  <div className="flex items-center justify-between" style={{ padding: '10px 0', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', color: '#FFA3AD' }}>Jual semua <span>›</span></div>
                  <div className="flex items-center justify-between" style={{ padding: '10px 0', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', color: 'var(--fk-text-mid)' }}>Batal <span>✕</span></div>
                </div>
              </div>
              <div className="fk-fbanner fk-fb-brand"><div><Star size={16} /></div><div><div className="fk-ft">Frakta Prime</div><div className="fk-fd">Akses penawaran perdana lebih awal dan biaya settlement lebih rendah.</div></div></div>
            </div>
          </div>
        </Section>

        {/* 05 Data */}
        <Section id="data" index="05" title="Data Display" desc="Aturan angka: mono selalu, tabular alignment kanan untuk kolom nilai, ± dengan warna semantic, pemisah ribuan gaya Indonesia (titik), desimal koma.">
          <div className="fk-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr>
                  {['Aset', 'Ticker', 'Harga', '24 jam', 'Kepemilikan'].map((h, i) => (
                    <th key={h} className="fk-mono" style={{ textAlign: i >= 2 ? 'right' : 'left', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', padding: '10px 16px', borderBottom: '1px solid var(--fk-line)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['IDDB', 'IDDB', 'Rp 1.052.300', '+2,41%', '128⁄10.000', true],
                  ['PRMA', 'PRMA', 'Rp 485.000', '−0,32%', '40⁄50.000', false],
                  ['VCAP', 'VCAP', 'Rp 2.104.850', '+0,88%', '12⁄5.000', true],
                ].map(([name, ticker, price, delta, own, gain]) => (
                  <tr key={name as string}>
                    <td className="fk-mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-hi)', fontSize: '12.5px' }}>{name}</td>
                    <td className="fk-mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-mid)', fontSize: '12.5px' }}>{ticker}</td>
                    <td className="fk-mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-hi)' }}>{price}</td>
                    <td className="fk-mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: gain ? 'var(--fk-gain)' : 'var(--fk-loss)' }}>{delta}</td>
                    <td className="fk-mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-mid)' }}>{own}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SubHeading>Categorical palette — data viz (v1.4)</SubHeading>
          <p style={{ fontSize: '13px', color: 'var(--fk-text-mid)', maxWidth: '640px', marginBottom: '14px' }}>
            Untuk alokasi portofolio, perbandingan aset, dan chart multi-seri. Urutan pemakaian tetap 1→8 (jangan diacak antar-screen).
            Cat-1 = Blue Soft agar seri pertama selalu terasa &quot;Frakta&quot;. Semua ≥5.7:1 di Surface 1 — jauh di atas syarat grafik 3:1.
          </p>
          <SwatchGrid>
            <Swatch hex="#6B85FF" name="Cat 1" token="5.71:1" height={44} />
            <Swatch hex="#43C6DB" name="Cat 2" token="9.20:1" height={44} />
            <Swatch hex="#D9A84E" name="Cat 3" token="8.59:1" height={44} />
            <Swatch hex="#9C7BF5" name="Cat 4" token="5.84:1" height={44} />
            <Swatch hex="#D97BC4" name="Cat 5" token="6.74:1" height={44} />
            <Swatch hex="#D98E6B" name="Cat 6" token="7.14:1" height={44} />
            <Swatch hex="#6FBF8F" name="Cat 7" token="8.47:1" height={44} />
            <Swatch hex="#8A93B3" name="Cat 8 · Lainnya" token="6.14:1" height={44} />
          </SwatchGrid>

          <div className="fk-card flex items-center flex-wrap" style={{ gap: '32px', padding: '24px', marginTop: '20px' }}>
            <svg width="140" height="140" viewBox="0 0 42 42" role="img" aria-label="Alokasi portofolio">
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="#171921" strokeWidth="6" />
              {dashArrays.map((s) => (
                <circle key={s.label} cx="21" cy="21" r="15.9" fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={s.dashoffset} />
              ))}
            </svg>
            <div style={{ flex: 1, minWidth: '220px' }}>
              {donutSlices.map((s) => (
                <div key={s.label} className="flex items-center justify-between" style={{ padding: '7px 0', borderBottom: '1px solid var(--fk-line-soft)', fontSize: '13px' }}>
                  <span className="flex items-center" style={{ gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: s.color }} />
                    {s.label}
                  </span>
                  <span className="fk-mono" style={{ fontSize: '12.5px' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <RuleGrid>
            <Rule tag="do"><b style={{ color: 'var(--fk-text-hi)' }}>Chart line pakai Frakta Blue</b>, area fill gradient blue→transparent. Gain/loss hanya untuk delta label, bukan warna garis chart.</Rule>
            <Rule tag="dont"><b style={{ color: 'var(--fk-text-hi)' }}>Jangan truncate angka uang.</b> Hash boleh dipotong tengah (0x4f2a…9c1e), rupiah tidak pernah.</Rule>
          </RuleGrid>
        </Section>

        {/* 06 Voice & Motion */}
        <Section id="voice" index="06" title="Voice &amp; Motion">
          <RuleGrid>
            <Rule tag="do" label="Voice"><b style={{ color: 'var(--fk-text-hi)' }}>Tenang, presisi, tanpa hype.</b> &quot;Order diproses on-chain&quot; — bukan &quot;Selamat! 🎉 Kamu keren!&quot;. Uang orang bukan tempat bermain kata.</Rule>
            <Rule tag="do" label="Voice"><b style={{ color: 'var(--fk-text-hi)' }}>Error selalu bilang cara memperbaiki.</b> Apa yang salah + langkah berikutnya, masing-masing satu kalimat.</Rule>
            <Rule tag="do" label="Motion"><b style={{ color: 'var(--fk-text-hi)' }}>150ms ease untuk hover, 250ms untuk overlay.</b> Angka harga boleh count-up sekali saat mount. Hormati prefers-reduced-motion.</Rule>
            <Rule tag="dont" label="Motion"><b style={{ color: 'var(--fk-text-hi)' }}>Tidak ada animasi looping</b> di area angka finansial — pulse/blink bikin data terasa tidak stabil.</Rule>
          </RuleGrid>
        </Section>

        {/* 07 WCAG */}
        <Section id="a11y" index="07" title="WCAG 2.1 Contrast Audit" desc="Semua pasangan token diaudit terhadap WCAG 2.1 (AA: 4.5:1 teks normal, 3:1 teks besar & non-text). Dua token dipatch di v1.0.1 berdasarkan hasil audit.">
          <div className="fk-card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
              <thead>
                <tr>
                  {['Pasangan', 'Rasio', 'Level', 'Catatan'].map((h, i) => (
                    <th key={h} className="fk-mono" style={{ textAlign: i === 1 ? 'right' : 'left', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', padding: '10px 16px', borderBottom: '1px solid var(--fk-line)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Text Hi / BG', '17.24', 'AAA', '—'],
                  ['Text Hi / Surface 3', '13.53', 'AAA', 'Modal tetap aman'],
                  ['Text Mid / Surface 2', '7.03', 'AAA', '—'],
                  ['Text Low / Surface 1', '4.80', 'AA', 'Patched: #5C6690 → #7080B3'],
                  ['Blue Bright / Surface 1', '4.69', 'AA', 'Link & teks biru selalu Blue Bright'],
                  ['Frakta Blue / BG', '3.82', 'AA-large', 'Dilarang sebagai teks normal'],
                  ['Putih / Frakta Blue (CTA)', '5.13', 'AA', '—'],
                  ['Putih / gradient start', '4.77', 'AA', 'Patched: #4D75FF → #3E67F0'],
                  ['Putih / Blue Deep (gradient end)', '7.99', 'AAA', '—'],
                  ['Gain / gain-tint', '7.84', 'AAA', 'Badge & alert'],
                  ['Loss / loss-tint', '5.41', 'AA', 'Badge, alert, tombol danger'],
                  ['Warn / warn-tint', '9.19', 'AAA', '—'],
                  ['Info / info-tint', '7.91', 'AAA', '—'],
                  ['Blue Bright / blue-tint', '4.23', 'AA-large', 'Badge brand: naikkan ke 500+ weight'],
                  ['Blue Soft / Surface 1', '5.71', 'AA', 'v1.1 — aman sebagai teks & ikon'],
                  ['Blue Soft / soft-tint', '4.78', 'AA', 'v1.1 — nav active & selected chip'],
                  ['Ink / Glow gradient', '6.59', 'AA', 'Glow card wajib teks gelap'],
                  ['Categorical 1–8 / Surface 1', '5.7–9.2', 'AA', 'v1.4.1 — lolos syarat grafik 3:1'],
                  ['Filled banner (semua varian)', '6.6–11.6', 'AA–AAA', 'Title & body di fill pekat'],
                  ['Border / Surface 1', '1.39', 'Dekoratif', 'Boundary input pakai label + focus ring'],
                ].map(([pair, ratio, level, note]) => (
                  <tr key={pair}>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-hi)' }}>{pair}</td>
                    <td className="fk-mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-mid)' }}>{ratio}</td>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', color: level.includes('AAA') ? 'var(--fk-gain)' : level.includes('AA-large') || level === 'Dekoratif' ? 'var(--fk-warn)' : 'var(--fk-gain)' }}>{level}</td>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-mid)', fontSize: '12.5px' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <RuleGrid>
            <Rule tag="do" label="Kebijakan teks biru"><b style={{ color: 'var(--fk-text-hi)' }}>Teks &amp; link biru = Blue Bright #4D75FF</b> (4.69:1). Frakta Blue #2E5CFF hanya untuk fill, border, dan focus ring.</Rule>
            <Rule tag="do" label="Non-color cue"><b style={{ color: 'var(--fk-text-hi)' }}>Gain/loss tidak boleh hanya lewat warna.</b> Selalu sertakan tanda +/− untuk pengguna buta warna merah-hijau (SC 1.4.1).</Rule>
          </RuleGrid>
        </Section>

        <footer style={{ padding: '32px 0', color: 'var(--fk-text-low)' }} className="fk-mono">
          <p style={{ fontSize: '11px' }}>FRAKTA DESIGN SYSTEM v1.4.1 · DARK MODE · GRID 4PT · WCAG 2.1 AA</p>
        </footer>
      </div>
    </div>
  )
}
