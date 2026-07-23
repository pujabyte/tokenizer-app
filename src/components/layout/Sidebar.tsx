'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Plus, Briefcase, Shield, FileText, Settings, ChevronsUpDown, Wallet, Copy, Check, LogOut, HelpCircle, Bell
} from 'lucide-react'
import clsx from 'clsx'
import { usePrivyUser } from '@/hooks/usePrivyUser'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create Token', href: '/dashboard/tokens/create', icon: Plus },
  { label: 'Assets', href: '/dashboard/assets', icon: Briefcase },
  { label: 'Compliance', href: '/dashboard/compliance', icon: Shield },
  { label: 'Contract Admin', href: '/dashboard/admin', icon: FileText },
]

const truncWallet = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

export default function Sidebar() {
  const pathname = usePathname()
  const user = usePrivyUser()
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(false)

  const copyWallet = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(user.walletAddress)
    setCopied(true)
    setToast(true)
    setTimeout(() => setCopied(false), 2000)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-30"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--fk-bg)',
        borderRight: '1px solid var(--fk-line-soft)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4"
        style={{ borderBottom: '1px solid var(--fk-line-soft)', height: 'var(--header-height)', minHeight: 'var(--header-height)' }}
      >
        <svg height="24" viewBox="0 0 1951 472" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%' }}>
          {/* Mark — blue + gradient (keep as-is) */}
          <path d="M372.595 12.2745C397.396 2.81805 437.26 -4.59145 463.226 3.38485C481.171 8.97064 496.143 21.4968 504.809 38.1759C513.685 55.2101 515.426 75.0753 509.648 93.3936C503.817 111.746 490.845 126.982 473.659 135.668C465.241 140.051 456.053 142.771 446.605 143.676C433.644 144.922 405.992 141.855 391.635 140.757C373.462 139.366 359.423 139.443 341.375 139.092C336.745 139.213 325.057 139.343 321.069 140.219C302.509 140.558 279.52 146.64 262.374 153.646C251.287 158.733 244.283 163.716 235.252 171.718C248.07 150.754 257.272 120.704 271.373 100.405L271.374 100.404C272.352 97.7652 277.259 90.3717 278.879 87.878C290.577 69.8646 313.706 44.0216 332.466 33.2452H332.467C333.341 32.0362 343.126 26.1552 344.867 25.0831C353.905 20.3145 363.061 15.9078 372.595 12.2745Z" fill="#085CF0"/>
          <path d="M334.952 23.3589L335.373 23.4586C335.254 23.8794 319.404 34.2 317.545 35.5357C253.462 81.6331 241.65 157.919 199.349 219.449C165.288 268.994 75.318 316.853 21.7497 268.356C1.45175 248.527 -5.19316 219.241 4.51498 192.48C14.3805 165.283 41.9501 146.622 70.5696 145.421C87.3209 144.718 104.425 147.434 121.272 146.063C144.24 144.42 163.674 140.204 184.484 130.108C216.783 114.44 238.815 89.397 265.45 66.5983C286.94 48.2035 309.343 35.0368 334.952 23.3589Z" fill="url(#sb_g0)"/>
          <path d="M292.968 254.171C312.475 246.733 343.829 240.905 364.252 247.179C378.367 251.572 390.143 261.425 396.959 274.544C403.94 287.942 405.31 303.567 400.766 317.975C396.179 332.41 385.976 344.393 372.459 351.225C365.838 354.672 358.61 356.812 351.18 357.524C340.985 358.504 319.236 356.091 307.943 355.228C295.437 354.271 285.419 354.197 273.601 354.009L268.412 353.918C264.771 354.013 255.576 354.116 252.439 354.805C237.841 355.072 219.76 359.856 206.273 365.365C197.552 369.366 192.044 373.285 184.94 379.579C195.023 363.09 202.261 339.454 213.353 323.488C214.121 321.414 217.982 315.598 219.256 313.637C228.457 299.468 246.65 279.142 261.405 270.666C262.093 269.714 269.79 265.088 271.159 264.245C278.268 260.495 285.469 257.029 292.968 254.171Z" fill="#085CF0"/>
          <path d="M263.102 263.431L263.432 263.509C263.339 263.839 250.884 271.936 249.424 272.983C199.069 309.147 189.787 368.993 156.548 417.264C129.784 456.132 59.089 493.678 16.9966 455.632C1.04713 440.076 -4.17424 417.101 3.45411 396.107C11.2061 374.771 32.8695 360.131 55.3578 359.189C68.5205 358.637 81.9601 360.768 95.1981 359.693C113.246 358.404 128.516 355.096 144.868 347.176C170.248 334.884 187.56 315.238 208.489 297.352C225.375 282.921 242.978 272.592 263.102 263.431Z" fill="url(#sb_g1)"/>
          {/* Wordmark — white on dark bg */}
          <path d="M1824.11 409.654C1806.58 409.654 1790.22 405.126 1775.03 396.07C1760.13 387.013 1748.01 373.867 1738.66 356.631C1729.6 339.395 1725.08 318.507 1725.08 293.968C1725.08 269.136 1729.6 247.956 1738.66 230.428C1748.01 212.9 1760.42 199.461 1775.91 190.113C1791.68 180.765 1809.07 176.09 1828.05 176.09C1840.32 176.09 1852.45 178.866 1864.43 184.416C1876.7 189.967 1886.92 197.416 1895.1 206.765V181.787H1950.75V403.081H1895.1V365.833C1888.67 377.811 1879.32 388.182 1867.05 396.946C1854.79 405.418 1840.47 409.654 1824.11 409.654ZM1838.13 354.002C1848.07 354.002 1857.27 351.373 1865.74 346.114C1874.5 340.856 1881.66 333.406 1887.21 323.766C1892.76 314.125 1895.39 302.732 1895.1 289.586V258.035C1887.21 249.563 1878.59 242.844 1869.25 237.877C1860.19 232.911 1850.26 230.428 1839.45 230.428C1827.76 230.428 1817.68 233.495 1809.21 239.63C1801.03 245.473 1794.6 253.215 1789.93 262.855C1785.26 272.496 1782.92 282.866 1782.92 293.968C1782.92 304.777 1785.26 314.855 1789.93 324.204C1794.6 333.26 1801.03 340.564 1809.21 346.114C1817.68 351.373 1827.32 354.002 1838.13 354.002Z" fill="white"/>
          <path d="M1629.98 409.652C1616.84 409.652 1604.86 406.73 1594.05 400.888C1583.53 395.045 1575.21 386.865 1569.07 376.348C1562.94 365.539 1559.87 352.831 1559.87 338.224V228.234H1523.06V199.751C1537.38 194.785 1549.06 185.582 1558.12 172.144C1567.47 158.706 1575.65 141.908 1582.66 121.75H1615.52V181.785H1682.13V228.234H1615.52V323.763C1615.52 333.696 1618.01 341.584 1622.97 347.426C1628.23 352.977 1635.83 355.752 1645.76 355.752C1654.52 355.752 1662.12 354.438 1668.55 351.809C1674.97 349.179 1680.67 346.404 1685.64 343.483V390.809C1680.38 396.359 1672.93 400.888 1663.29 404.393C1653.94 407.899 1642.84 409.652 1629.98 409.652Z" fill="white"/>
          <path d="M1328.94 350.934V287.394L1429.73 181.787H1497.21L1328.94 350.934ZM1283.8 403.08V87.5723H1339.46V403.08H1283.8ZM1431.92 403.08L1354.79 298.349L1389.85 260.225L1502.03 403.08H1431.92Z" fill="white"/>
          <path d="M1088.8 409.654C1071.27 409.654 1054.91 405.126 1039.72 396.07C1024.82 387.013 1012.7 373.867 1003.35 356.631C994.294 339.395 989.766 318.507 989.766 293.968C989.766 269.136 994.294 247.956 1003.35 230.428C1012.7 212.9 1025.11 199.461 1040.6 190.113C1056.37 180.765 1073.76 176.09 1092.74 176.09C1105.01 176.09 1117.14 178.866 1129.12 184.416C1141.38 189.967 1151.61 197.416 1159.79 206.765V181.787H1215.44V403.081H1159.79V365.833C1153.36 377.811 1144.01 388.182 1131.74 396.946C1119.47 405.418 1105.16 409.654 1088.8 409.654ZM1102.82 354.002C1112.76 354.002 1121.96 351.373 1130.43 346.114C1139.19 340.856 1146.35 333.406 1151.9 323.766C1157.45 314.125 1160.08 302.732 1159.79 289.586V258.035C1151.9 249.563 1143.28 242.844 1133.94 237.877C1124.88 232.911 1114.95 230.428 1104.14 230.428C1092.45 230.428 1082.37 233.495 1073.9 239.63C1065.72 245.473 1059.29 253.215 1054.62 262.855C1049.95 272.496 1047.61 282.866 1047.61 293.968C1047.61 304.777 1049.95 314.855 1054.62 324.204C1059.29 333.26 1065.72 340.564 1073.9 346.114C1082.37 351.373 1092.01 354.002 1102.82 354.002Z" fill="white"/>
          <path d="M822.811 403.081V181.787H878.463V403.081H822.811ZM878.463 279.507V223.417C886.058 210.271 894.968 199.316 905.193 190.551C915.71 181.787 927.542 177.405 940.688 177.405C948.868 177.405 956.025 178.72 962.16 181.349V244.013C957.778 241.383 953.104 239.484 948.137 238.316C943.463 236.855 938.351 236.125 932.8 236.125C920.238 236.125 909.575 240.361 900.811 248.833C892.339 257.013 884.89 267.237 878.463 279.507Z" fill="white"/>
          <path d="M663.742 403.081V162.068C663.742 144.832 667.247 130.225 674.259 118.247C681.562 106.27 691.057 97.0675 702.742 90.6405C714.72 84.2135 727.574 81 741.304 81C750.653 81 758.832 82.0225 765.844 84.0674C773.147 86.1124 779.282 88.8877 784.248 92.3934V138.843C779.866 136.214 774.754 134.169 768.911 132.708C763.361 130.955 757.372 130.225 750.945 130.517C742.181 130.517 734.731 133.293 728.596 138.843C722.461 144.102 719.394 153.012 719.394 165.574V403.081H663.742ZM630 228.237V181.787H776.799V228.237H630Z" fill="white"/>
          <defs>
            <linearGradient id="sb_g0" x1="167.746" y1="23.3589" x2="167.746" y2="288.55" gradientUnits="userSpaceOnUse">
              <stop stopColor="#085CF0"/><stop offset="1" stopColor="#0A2677"/>
            </linearGradient>
            <linearGradient id="sb_g1" x1="131.716" y1="263.431" x2="131.716" y2="471.474" gradientUnits="userSpaceOnUse">
              <stop stopColor="#085CF0"/><stop offset="1" stopColor="#0A2677"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors',
                !isActive && 'hover:bg-white/[0.05]'
              )}
              style={{
                color: isActive ? 'var(--fk-blue-soft)' : 'var(--fk-text-mid)',
                backgroundColor: isActive ? 'var(--fk-soft-tint)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
              }}
            >
              <Icon size={17} strokeWidth={1.75} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="px-3 pb-3 pt-2.5" style={{ borderTop: '1px solid var(--fk-line-soft)', position: 'relative' }}>

        {/* Popover */}
        {open && (
          <>
            {/* Backdrop */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
            {/* Panel */}
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 12, zIndex: 50,
              width: 280,
              background: 'var(--fk-surface-2)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--r-lg)', overflow: 'hidden',
              boxShadow: '0 -16px 48px rgba(0,0,0,.6)',
            }}>
              {/* Header: avatar + name + email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: user.loginType === 'email' ? 'var(--fk-grad)' : 'var(--fk-surface-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#fff',
                }}>
                  {user.loginType === 'email' ? user.avatarInitial : <Wallet size={16} strokeWidth={2} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.displayName}
                  </p>
                  {user.email && (
                    <p style={{ fontSize: 11, color: 'var(--fk-text-low)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Wallet address + copy */}
              <div style={{ padding: '10px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{ fontSize: 11, color: 'var(--fk-text-low)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {truncWallet(user.walletAddress)}
                  </p>
                  <button
                    onClick={copyWallet}
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: '4px 6px', borderRadius: 'var(--r-sm)', cursor: 'pointer', color: copied ? 'var(--fk-gain)' : 'var(--fk-text-low)', fontSize: 11, fontWeight: 500, transition: 'color .2s' }}
                  >
                    {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--fk-line-soft)', margin: '0 16px' }} />

              {/* Settings + Log out */}
              <div style={{ padding: '6px' }}>
                <a
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 'var(--r-md)', color: 'var(--fk-text-mid)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'background .15s, color .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-3)'; e.currentTarget.style.color = 'var(--fk-text-hi)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--fk-text-mid)' }}
                >
                  <Settings size={15} strokeWidth={1.75} />
                  Settings
                </a>
                <button
                  onClick={() => { window.location.href = '/auth' }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 'var(--r-md)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fk-loss)', fontSize: 13, fontWeight: 500, transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--fk-loss-tint)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={15} strokeWidth={1.75} />
                  Log out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Trigger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.05] transition-colors"
          style={{ background: open ? 'rgba(255,255,255,.05)' : undefined }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ width: 30, height: 30, borderRadius: '50%', background: user.loginType === 'email' ? 'var(--fk-grad)' : 'var(--fk-surface-3)', color: '#fff' }}
          >
            {user.loginType === 'email' ? user.avatarInitial : <Wallet size={13} strokeWidth={2} />}
          </div>
          <div className="flex-1 min-w-0 text-left" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <p className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--fk-text-hi)', lineHeight: 1.3 }}>
              {user.displayName}
            </p>
            <p className="truncate" style={{ fontSize: 10, color: 'var(--fk-text-low)', lineHeight: 1.3, fontFamily: 'var(--font-mono)' }}>
              {truncWallet(user.walletAddress)}
            </p>
          </div>
          <ChevronsUpDown size={13} style={{ color: 'var(--fk-text-low)', flexShrink: 0 }} />
        </button>
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 12}px)`,
        zIndex: 100, pointerEvents: 'none',
        background: 'var(--fk-surface-2)', border: '1px solid var(--glass-border)',
        borderRadius: 'var(--r-pill)', padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,.5)',
        opacity: toast ? 1 : 0,
        transition: 'opacity .2s, transform .2s',
      }}>
        <Check size={13} strokeWidth={2.5} style={{ color: 'var(--fk-gain)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fk-text-hi)', whiteSpace: 'nowrap' }}>Wallet address copied</span>
      </div>
    </aside>
  )
}
