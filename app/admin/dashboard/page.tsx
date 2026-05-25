'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:          { label: 'Pending',           color: '#92400e', bg: '#fef3c7' },
  confirmed:        { label: 'Confirmed',         color: '#1e40af', bg: '#dbeafe' },
  out_for_delivery: { label: 'Out for Delivery',  color: '#6b21a8', bg: '#f3e8ff' },
  completed:        { label: 'Completed',         color: '#166534', bg: '#dcfce7' },
  cancelled:        { label: 'Cancelled',         color: '#991b1b', bg: '#fee2e2' },
}

const STATUSES = Object.keys(STATUS_CONFIG)

const PRODUCT_META = [
  { key: 'kesar_qty',        label: 'Kesar',        price: 44 },
  { key: 'alphonso_qty',     label: 'Alphonso',     price: 46 },
  { key: 'banganapalli_qty', label: 'Banganapalli', price: 44 },
  { key: 'totapuri_qty',     label: 'Totapuri',     price: 46 },
  { key: 'jumbo_kesar_qty',  label: 'Jumbo Kesar',  price: 45 },
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

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/orders')
    if (res.status === 401) { router.push('/admin'); return }
    const data = await res.json()
    setOrders(data.orders || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchOrders() }, [fetchOrders])
  useEffect(() => { setCurrentPage(1) }, [filter, search, dateFilter])

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
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.city.toLowerCase().includes(search.toLowerCase())
    const matchDate = !dateFilter || o.delivery_date.includes(dateFilter)
    return matchStatus && matchSearch && matchDate
  })

  const totalPages = Math.ceil(filtered.length / ordersPerPage)
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  )

  // ── STATS ──────────────────────────────────────────────────
  const notCancelled   = orders.filter(o => o.status !== 'cancelled')
  const homeOrders     = notCancelled.filter(o => o.order_type !== 'courier')
  const courierOrders  = notCancelled.filter(o => o.order_type === 'courier')

  // Total revenue = sum of total_amount for all non-cancelled orders
  // (courier orders already priced at $55/box so total_amount is correct)
  const totalRevenue   = notCancelled.reduce((s, o) => s + Number(o.total_amount), 0)
  const homeRevenue    = homeOrders.reduce((s, o) => s + Number(o.total_amount), 0)
  const courierRevenue = courierOrders.reduce((s, o) => s + Number(o.total_amount), 0)

  const statGroups = [
    // Row 1 — Order counts
    { label: 'Total Orders',      val: orders.length,                                        highlight: false },
    { label: '🏠 Home Delivery',  val: orders.filter(o => o.order_type !== 'courier').length, highlight: false },
    { label: '📦 Courier Orders', val: orders.filter(o => o.order_type === 'courier').length, highlight: false },
    { label: 'Pending',           val: orders.filter(o => o.status === 'pending').length,     highlight: false },
    { label: 'Confirmed',         val: orders.filter(o => o.status === 'confirmed').length,   highlight: false },
    { label: 'Completed',         val: orders.filter(o => o.status === 'completed').length,   highlight: false },
    // Row 2 — Revenue
    { label: 'Total Revenue',     val: `$${totalRevenue} CAD`,   highlight: true  },
    { label: 'Home Revenue',      val: `$${homeRevenue} CAD`,    highlight: false },
    { label: 'Courier Revenue',   val: `$${courierRevenue} CAD`, highlight: false },
    // Row 3 — Box counts
    { label: 'Kesar Boxes',       val: notCancelled.reduce((s, o) => s + (o.kesar_qty || 0), 0),        highlight: false },
    { label: 'Alphonso Boxes',    val: notCancelled.reduce((s, o) => s + (o.alphonso_qty || 0), 0),     highlight: false },
    { label: 'Banganapalli',      val: notCancelled.reduce((s, o) => s + (o.banganapalli_qty || 0), 0), highlight: false },
    { label: 'Totapuri Boxes',    val: notCancelled.reduce((s, o) => s + (o.totapuri_qty || 0), 0),     highlight: false },
    { label: 'Jumbo Kesar',       val: notCancelled.reduce((s, o) => s + (o.jumbo_kesar_qty || 0), 0),  highlight: false },
  ]

  // ── STYLES ─────────────────────────────────────────────────
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

  // Stat section labels
  const sectionLabel = (text: string) => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6, marginTop: 16 }}>
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
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchOrders} style={{ ...s.input as any, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            ↻ Refresh
          </button>
          <button onClick={handleLogout} style={{ ...s.input as any, cursor: 'pointer', background: '#dc2626', color: 'white', border: 'none' }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={s.content}>

        {/* ── STATS ── */}

        {/* Orders */}
        {sectionLabel('Orders')}
        <div style={s.statsGrid}>
          {statGroups.slice(0, 6).map(st => (
            <div key={st.label} style={{
              ...s.statCard,
              ...(st.highlight ? { border: '1.5px solid #d4801a', background: '#fffbeb' } : {}),
            }}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={{ ...s.statVal, ...(st.highlight ? { color: '#b45309' } : {}) }}>{st.val}</div>
            </div>
          ))}
        </div>

        {/* Revenue */}
        {sectionLabel('Revenue (excl. cancelled)')}
        <div style={{ ...s.statsGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 8 }}>
          {statGroups.slice(6, 9).map(st => (
            <div key={st.label} style={{
              ...s.statCard,
              ...(st.highlight ? { border: '1.5px solid #d4801a', background: '#fffbeb' } : {}),
            }}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={{ ...s.statVal, fontSize: 18, ...(st.highlight ? { color: '#b45309' } : {}) }}>{st.val}</div>
            </div>
          ))}
        </div>

        {/* Box counts */}
        {sectionLabel('Boxes Sold (excl. cancelled)')}
        <div style={{ ...s.statsGrid, marginBottom: 24 }}>
          {statGroups.slice(9).map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={s.statVal}>{st.val}</div>
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
          <input
            type="text"
            placeholder="Filter by date (e.g. May)"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ ...s.input, width: 160 }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button style={filterBtn(filter === 'all')} onClick={() => setFilter('all')}>All ({orders.length})</button>
            {STATUSES.map(st => (
              <button key={st} style={filterBtn(filter === st)} onClick={() => setFilter(st)}>
                {STATUS_CONFIG[st].label} ({orders.filter(o => o.status === st).length})
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
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const isCourier = order.order_type === 'courier'

            const itemSummary = PRODUCT_META
              .filter(p => (order[p.key as keyof Order] as number) > 0)
              .map(p => `${order[p.key as keyof Order]} × ${p.label}`)
              .join(' · ')

            return (
              <div key={order.id} style={s.card}>
                {/* Card Header */}
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

                {/* Expanded Details */}
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
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: '#1b4332', textDecoration: 'none' }}
                          >
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

                      {/* Product lines — only show if qty > 0 */}
                      {PRODUCT_META.filter(p => (order[p.key as keyof Order] as number) > 0).map(p => {
                        const qty = order[p.key as keyof Order] as number
                        // Courier Kesar is priced at $55
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
                        <div style={{ ...s.detailVal, fontFamily: 'Georgia, serif', fontSize: 16, color: '#1b4332' }}>
                          ${order.total_amount} CAD
                        </div>
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

                    {/* Status buttons */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1b4332', marginTop: 16, marginBottom: 8 }}>
                        Update Status:
                      </div>
                      <div style={s.statusRow}>
                        {STATUSES.map(st => (
                          <button
                            key={st}
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, st)}
                            style={statusBtn(order.status === st, st)}
                          >
                            {order.status === st ? '✓ ' : ''}{STATUS_CONFIG[st].label}
                          </button>
                        ))}
                      </div>
                      {updating === order.id && (
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>Updating…</div>
                      )}
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
