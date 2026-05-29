'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getNextDeliveryDates } from '@/lib/dates'

type Order = {
  id: string
  created_at: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  city: string
  postal_code: string
  kesar_qty: number
  alphonso_qty: number
  banganapalli_qty: number
  totapuri_qty: number
  jumbo_kesar_qty: number
  total_amount: number
  delivery_date: string
  special_instructions?: string
  order_type?: string
  status: string
}

type Settings = {
  orders_open: boolean
  kesar_home_open: boolean
  kesar_courier_open: boolean
  alphonso_open: boolean
  banganapalli_open: boolean
  totapuri_open: boolean
  jumbo_kesar_open: boolean
}

const DEFAULT_SETTINGS: Settings = {
  orders_open: true,
  kesar_home_open: true,
  kesar_courier_open: true,
  alphonso_open: true,
  banganapalli_open: true,
  totapuri_open: true,
  jumbo_kesar_open: true,
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:          { label: 'Pending',           color: '#92400e', bg: '#fef3c7' },
  confirmed:        { label: 'Confirmed',         color: '#1e40af', bg: '#dbeafe' },
  out_for_delivery: { label: 'Out for Delivery',  color: '#6b21a8', bg: '#f3e8ff' },
  completed:        { label: 'Completed',         color: '#166534', bg: '#dcfce7' },
  cancelled:        { label: 'Cancelled',         color: '#991b1b', bg: '#fee2e2' },
}

const STATUSES = Object.keys(STATUS_CONFIG)

const PRODUCT_META = [
  { key: 'kesar_qty',        label: 'Kesar',        price: 44, settingKey: 'kesar_open' },
  { key: 'alphonso_qty',     label: 'Alphonso',     price: 46, settingKey: 'alphonso_open' },
  { key: 'banganapalli_qty', label: 'Banganapalli', price: 44, settingKey: 'banganapalli_open' },
  { key: 'totapuri_qty',     label: 'Totapuri',     price: 46, settingKey: 'totapuri_open' },
  { key: 'jumbo_kesar_qty',  label: 'Jumbo Kesar',  price: 45, settingKey: 'jumbo_kesar_open' },
]

const VARIETY_TOGGLES = [
  { key: 'kesar_home_open',    label: 'Kesar (Home Delivery)', emoji: '🟡' },
  { key: 'kesar_courier_open', label: 'Kesar (Courier)',        emoji: '📦' },
  { key: 'alphonso_open',      label: 'Alphonso',               emoji: '🟠' },
  { key: 'banganapalli_open',  label: 'Banganapalli',           emoji: '🟢' },
  { key: 'totapuri_open',      label: 'Totapuri',               emoji: '🍃' },
  { key: 'jumbo_kesar_open',   label: 'Jumbo Kesar',            emoji: '👑' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const deliveryDates = getNextDeliveryDates()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [ordersRes, settingsRes] = await Promise.all([
      fetch('/api/admin/orders'),
      fetch('/api/admin/settings'),
    ])
    if (ordersRes.status === 401) { router.push('/admin'); return }
    const ordersData = await ordersRes.json()
    const settingsData = await settingsRes.json()
    setOrders(ordersData.orders || [])
    setSettings({ ...DEFAULT_SETTINGS, ...settingsData })
    setSettingsLoaded(true)
    setLoading(false)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setCurrentPage(1) }, [filter, search, dateFilter])

  const toggle = async (key: keyof Settings) => {
    setToggling(key)
    const newVal = !settings[key]
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: newVal }),
    })
    if (res.ok) setSettings(prev => ({ ...prev, [key]: newVal }))
    setToggling(null)
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    setUpdating(null)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  const filtered = orders.filter(o => {
    // const matchStatus = filter === 'all' || o.status === filter
  const matchStatus =
   filter === 'all'
    ? o.status !== 'cancelled'
    : o.status === filter
    const matchSearch = !search ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.city.toLowerCase().includes(search.toLowerCase())
    // const matchDate = !dateFilter || o.delivery_date.includes(dateFilter)
    const matchDate =
  !dateFilter || o.delivery_date === dateFilter
    return matchStatus && matchSearch && matchDate
  })

  const totalPages = Math.ceil(filtered.length / ordersPerPage)
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  )

  const notCancelled  = orders.filter(o => o.status !== 'cancelled')
  const homeOrders    = notCancelled.filter(o => o.order_type !== 'courier')
  const courierOrders = notCancelled.filter(o => o.order_type === 'courier')
  const totalRevenue  = notCancelled.reduce((s, o) => s + Number(o.total_amount), 0)
  const homeRevenue   = homeOrders.reduce((s, o) => s + Number(o.total_amount), 0)
  const courierRevenue = courierOrders.reduce((s, o) => s + Number(o.total_amount), 0)

  const statGroups = [
    // { label: 'Total Orders',      val: orders.length },
    // { label: '🏠 Home Delivery',  val: orders.filter(o => o.order_type !== 'courier').length },
    // { label: '📦 Courier Orders', val: orders.filter(o => o.order_type === 'courier').length },
    // { label: 'Pending',           val: orders.filter(o => o.status === 'pending').length },
    // { label: 'Confirmed',         val: orders.filter(o => o.status === 'confirmed').length },
    // { label: 'Completed',         val: orders.filter(o => o.status === 'completed').length },
  
  { label: 'Total Orders',      val: notCancelled.length },
  { label: '🏠 Home Delivery',  val: notCancelled.filter(o => o.order_type !== 'courier').length },
  { label: '📦 Courier Orders', val: notCancelled.filter(o => o.order_type === 'courier').length },
  { label: 'Pending',           val: notCancelled.filter(o => o.status === 'pending').length },
  { label: 'Confirmed',         val: notCancelled.filter(o => o.status === 'confirmed').length },
  { label: 'Completed',         val: notCancelled.filter(o => o.status === 'completed').length },

  ]

  const s: Record<string, React.CSSProperties> = {
    page:       { minHeight: '100vh', background: '#f1f5f4', fontFamily: 'Lato, sans-serif' },
    topbar:     { background: '#1b4332', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 },
    content:    { maxWidth: 1200, margin: '0 auto', padding: '24px 16px' },
    statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 8 },
    statCard:   { background: 'white', borderRadius: 10, padding: '12px 14px', border: '0.5px solid #e5e7eb' },
    statLabel:  { fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 } as React.CSSProperties,
    statVal:    { fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif', color: '#1b4332' },
    toolbar:    { background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 } as React.CSSProperties,
    input:      { padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, fontFamily: 'Lato, sans-serif', outline: 'none' },
    card:       { background: 'white', borderRadius: 10, border: '0.5px solid #e5e7eb', marginBottom: 10, overflow: 'hidden' },
    cardHeader: { padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexWrap: 'wrap' } as React.CSSProperties,
    cardBody:   { padding: '0 16px 16px', borderTop: '1px solid #f3f4f6' },
    detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 },
    detailLabel:{ fontSize: 10, color: '#9ca3af', marginBottom: 2 },
    detailVal:  { fontSize: 13, color: '#111827', fontWeight: 500 },
    statusRow:  { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 } as React.CSSProperties,
  }

  const badge = (status: string): React.CSSProperties => ({
    padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700,
    background: STATUS_CONFIG[status]?.bg || '#f3f4f6',
    color: STATUS_CONFIG[status]?.color || '#374151',
    whiteSpace: 'nowrap',
  })

  const filterBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    border: 'none', cursor: 'pointer',
    background: active ? '#1b4332' : '#f3f4f6',
    color: active ? 'white' : '#374151',
    fontFamily: 'Lato, sans-serif',
  })

  const statusBtn = (active: boolean, status: string): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
    border: `1.5px solid ${STATUS_CONFIG[status]?.color || '#d1d5db'}`,
    cursor: 'pointer', fontFamily: 'Lato, sans-serif',
    background: active ? STATUS_CONFIG[status]?.bg : 'white',
    color: STATUS_CONFIG[status]?.color || '#374151',
    opacity: active ? 1 : 0.6,
  })

  const SlideToggle = ({ settingKey, label }: { settingKey: keyof Settings; label: string }) => {
    const isOn = settings[settingKey]
    const isToggling = toggling === settingKey
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'white', borderRadius: 8, border: `1px solid ${isOn ? '#bbf7d0' : '#fecaca'}` }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{label}</div>
          <div style={{ fontSize: 10, color: isOn ? '#166534' : '#991b1b', marginTop: 1 }}>
            {isOn ? '✓ Accepting orders' : '✗ Not available'}
          </div>
        </div>
        <button
          onClick={() => toggle(settingKey)}
          disabled={isToggling}
          style={{
            position: 'relative',
            width: 44,
            height: 24,
            borderRadius: 12,
            border: 'none',
            cursor: isToggling ? 'wait' : 'pointer',
            background: isOn ? '#22c55e' : '#d1d5db',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute',
            top: 3,
            left: isOn ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'white',
            transition: 'left 0.2s',
            display: 'block',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>
    )
  }

  const sectionLabel = (text: string) => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8, marginTop: 20 }}>
      {text}
    </div>
  )

  return (
    <div style={s.page}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>👑</span>
          <div>
            <div style={{ color: 'white', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 14 }}>Royal Maharaja Mango</div>
            <div style={{ color: '#f59e0b', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>Admin Dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Master Orders toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: `1px solid ${settings.orders_open ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, borderRadius: 8, padding: '6px 12px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
              {!settingsLoaded ? '…' : settings.orders_open ? '🟢 Orders: ON' : '🔴 Orders: OFF'}
            </span>
            <button
              onClick={() => toggle('orders_open')}
              disabled={toggling === 'orders_open' || !settingsLoaded}
              style={{
                position: 'relative', width: 44, height: 24, borderRadius: 12,
                border: 'none', cursor: toggling === 'orders_open' ? 'wait' : 'pointer',
                background: settings.orders_open ? '#22c55e' : '#6b7280',
                transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3,
                left: settings.orders_open ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s', display: 'block',
              }} />
            </button>
          </div>
          <button onClick={fetchData} style={{ ...s.input as any, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            ↻ Refresh
          </button>
          <button onClick={handleLogout} style={{ ...s.input as any, cursor: 'pointer', background: '#dc2626', color: 'white', border: 'none' }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={s.content}>

        {/* ── AVAILABILITY CONTROLS ── */}
        {sectionLabel('Availability Controls')}
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '16px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 14, color: '#1b4332' }}>Master Switch</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Turns all ordering on or off instantly</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: settings.orders_open ? '#166534' : '#991b1b' }}>
                {!settingsLoaded ? '…' : settings.orders_open ? '🟢 Open — accepting orders' : '🔴 Closed — not accepting orders'}
              </span>
              <button
                onClick={() => toggle('orders_open')}
                disabled={toggling === 'orders_open' || !settingsLoaded}
                style={{
                  position: 'relative', width: 52, height: 28, borderRadius: 14,
                  border: 'none', cursor: toggling === 'orders_open' ? 'wait' : 'pointer',
                  background: settings.orders_open ? '#22c55e' : '#d1d5db',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 4,
                  left: settings.orders_open ? 28 : 4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s', display: 'block',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
            Per-Variety Availability
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
            {VARIETY_TOGGLES.map(v => (
              <SlideToggle key={v.key} settingKey={v.key as keyof Settings} label={`${v.emoji} ${v.label}`} />
            ))}
          </div>
          {!settings.orders_open && (
            <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 7, background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 600 }}>
              ⚠️ Master switch is OFF — all orders are blocked regardless of per-variety settings.
            </div>
          )}
        </div>

        {/* ── STATS ── */}
        {sectionLabel('Orders')}
        <div style={s.statsGrid}>
          {statGroups.map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={s.statVal}>{st.val}</div>
            </div>
          ))}
        </div>

        {sectionLabel('Revenue (excl. cancelled)')}
        <div style={{ ...s.statsGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 8 }}>
          {[
            { label: 'Total Revenue',   val: `$${totalRevenue} CAD`,   highlight: true },
            { label: 'Home Revenue',    val: `$${homeRevenue} CAD`,    highlight: false },
            { label: 'Courier Revenue', val: `$${courierRevenue} CAD`, highlight: false },
          ].map(st => (
            <div key={st.label} style={{ ...s.statCard, ...(st.highlight ? { border: '1.5px solid #d4801a', background: '#fffbeb' } : {}) }}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={{ ...s.statVal, fontSize: 18, ...(st.highlight ? { color: '#b45309' } : {}) }}>{st.val}</div>
            </div>
          ))}
        </div>

        {sectionLabel('Boxes Sold (excl. cancelled)')}
        <div style={{ ...s.statsGrid, marginBottom: 24 }}>
          {PRODUCT_META.map(p => (
            <div key={p.key} style={s.statCard}>
              <div style={s.statLabel}>{p.label}</div>
              <div style={s.statVal}>{notCancelled.reduce((s, o) => s + ((o[p.key as keyof Order] as number) || 0), 0)}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <input
            placeholder="Search name, phone, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...s.input, flex: 1, minWidth: 160 }}
          />
          {/* <input
            type="text"
            placeholder="Filter by date (e.g. May)"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ ...s.input, width: 160 }}
          /> */}
          <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                ...s.input,
                width: 320,
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">All Delivery Dates</option>

              {deliveryDates.map((date) => (
                 <option key={date} value={date}>
                  {/* {date} ({orders.filter(o => o.delivery_date === date).length}) */}
                  {date} ({notCancelled.filter(o => o.delivery_date === date).length})

              </option>
                
              ))}
            </select>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {/* <button style={filterBtn(filter === 'all')} onClick={() => setFilter('all')}>All ({orders.length})</button> */}
            <button style={filterBtn(filter === 'all')} onClick={() => setFilter('all')}>All ({notCancelled.length})</button>  

            {STATUSES.map(st => (
              <button key={st} style={filterBtn(filter === st)} onClick={() => setFilter(st)}>
                {STATUS_CONFIG[st].label} ({orders.filter(o => o.status === st).length})
                {/* {STATUS_CONFIG[st].label} ({notCancelled.filter(o => o.status === st).length} */}
                )
              </button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No orders found.</div>
        ) : (
          paginatedOrders.map(order => {
            const expanded = expandedId === order.id
            // const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

            const isCourier = order.order_type === 'courier'

            const itemSummary = PRODUCT_META
              .filter(p => (order[p.key as keyof Order] as number) > 0)
              .map(p => `${order[p.key as keyof Order]} × ${p.label}`)
              .join(' · ')

            return (
              <div key={order.id} style={s.card}>
                <div style={s.cardHeader} onClick={() => setExpandedId(expanded ? null : order.id)}>
                  {isCourier && (
                    <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 9, fontWeight: 700, background: '#fef3c7', color: '#92400e', whiteSpace: 'nowrap' }}>
                      📦 Courier
                    </span>
                  )}
                  <span style={badge(order.status)}>{cfg.label}</span>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{order.customer_name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{order.customer_phone} · {order.city}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#374151' }}>🥭 {itemSummary || '—'}</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1b4332', fontSize: 15, whiteSpace: 'nowrap' }}>
                    ${order.total_amount} CAD
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'right', minWidth: 90 }}>
                    📅 {order.delivery_date.split(',')[0]}
                    <br />{order.delivery_date.split(',').slice(1).join(',').trim()}
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: 16 }}>{expanded ? '▲' : '▼'}</span>
                </div>

                {expanded && (
                  <div style={s.cardBody}>
                    <div style={s.detailGrid}>
                      <div>
                        <div style={s.detailLabel}>Full Name</div>
                        <div style={s.detailVal}>{order.customer_name}</div>
                      </div>
                      <div>
                        <div style={s.detailLabel}>Phone / WhatsApp</div>
                        <div style={s.detailVal}>
                          <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1b4332', textDecoration: 'none' }}>
                            {order.customer_phone} 📲
                          </a>
                        </div>
                      </div>
                      <div>
                        <div style={s.detailLabel}>Email</div>
                        <div style={s.detailVal}>
                          <a href={`mailto:${order.customer_email}`} style={{ color: '#1b4332' }}>{order.customer_email}</a>
                        </div>
                      </div>
                      <div>
                        <div style={s.detailLabel}>Delivery Date</div>
                        <div style={s.detailVal}>{order.delivery_date}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={s.detailLabel}>Delivery Address</div>
                        <div style={s.detailVal}>{order.delivery_address}, {order.city}, {order.postal_code}</div>
                      </div>
                      {PRODUCT_META.filter(p => (order[p.key as keyof Order] as number) > 0).map(p => {
                        const qty = order[p.key as keyof Order] as number
                        const unitPrice = (isCourier && p.key === 'kesar_qty') ? 55 : p.price
                        return (
                          <div key={p.key}>
                            <div style={s.detailLabel}>{p.label} Boxes{isCourier && p.key === 'kesar_qty' ? ' (Courier $55)' : ''}</div>
                            <div style={s.detailVal}>{qty} × ${unitPrice} = ${qty * unitPrice} CAD</div>
                          </div>
                        )
                      })}
                      <div>
                        <div style={s.detailLabel}>Order Total</div>
                        <div style={{ ...s.detailVal, fontFamily: 'Georgia, serif', fontSize: 16, color: '#1b4332' }}>${order.total_amount} CAD</div>
                      </div>
                      <div>
                        <div style={s.detailLabel}>Order Type</div>
                        <div style={{ ...s.detailVal, fontWeight: 700, color: isCourier ? '#92400e' : '#166534' }}>
                          {isCourier ? '📦 Courier' : '🏠 Home Delivery'}
                        </div>
                      </div>
                      {order.special_instructions && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={s.detailLabel}>Special Instructions</div>
                          <div style={{ ...s.detailVal, background: '#fffbeb', padding: '8px 10px', borderRadius: 6, fontSize: 12 }}>
                            {order.special_instructions}
                          </div>
                        </div>
                      )}
                      <div>
                        <div style={s.detailLabel}>Order ID</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>{order.id}</div>
                      </div>
                      <div>
                        <div style={s.detailLabel}>Ordered On</div>
                        <div style={s.detailVal}>{new Date(order.created_at).toLocaleString('en-CA')}</div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1b4332', marginTop: 16, marginBottom: 8 }}>Update Status:</div>
                      <div style={s.statusRow}>
                        {STATUSES.map(st => (
                          <button key={st} disabled={updating === order.id} onClick={() => updateStatus(order.id, st)} style={statusBtn(order.status === st, st)}>
                            {order.status === st ? '✓ ' : ''}{STATUS_CONFIG[st].label}
                          </button>
                        ))}
                      </div>
                      {updating === order.id && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>Updating…</div>}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === 1 ? '#f3f4f6' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === i + 1 ? '#1b4332' : 'white', color: currentPage === i + 1 ? 'white' : '#111827', fontWeight: 700, cursor: 'pointer', minWidth: 36 }}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === totalPages ? '#f3f4f6' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next →
            </button>
          </div>
        )}
       
      </div>
    </div>
  )
}
