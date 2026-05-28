'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getNextDeliveryDates } from '@/lib/dates'
import { Order } from '@/lib/supabase'

const PRODUCTS = [
  {
    id: 'kesar',
    name: 'Kesar Mangoes',
    subtitle: 'The Queen of Mangoes',
    price: 44,
    weight: '3 kg gross · 2.8 kg net',
    pieces: '',
    origin: 'Gir, Gujarat',
    description: 'Rich saffron-hued flesh, intensely sweet with a honey-like aroma. Handpicked from sun-drenched orchards in Gir, Gujarat.',
    emoji: '🥭',
    highlights: ['Rich Saffron Color', 'Fibreless Pulp', 'Naturally Sweet'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'alphonso',
    name: 'Alphonso Mangoes',
    subtitle: 'The King of Mangoes',
    price: 46,
    weight: '3 kg gross · 2.8 kg net',
    pieces: '',
    origin: 'Ratnagiri, Maharashtra',
    description: 'India\'s most celebrated mango. Buttery smooth, non-fibrous with a rich, creamy texture and intoxicating fragrance.',
    emoji: '🥭',
    highlights: ['Creamy Texture', 'GI Tagged', 'Exotic Fragrance'],
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'banganapalli',
    name: 'Banganapalli Mangoes',
    subtitle: 'The Pride of Andhra',
    price: 44,
    weight: '3.1 kg gross · 2.8 kg net',
    pieces: '~12 pcs/box',
    origin: 'Andhra Pradesh',
    description: 'Large, golden-yellow mangoes with thin skin and firm, sweet flesh. A GI-tagged treasure from the sun-kissed fields of Andhra Pradesh.',
    emoji: '🥭',
    highlights: ['GI Tagged', 'Firm Sweet Flesh', '~12 pcs/box'],
    color: 'from-yellow-400 to-lime-500',
  },
  {
    id: 'totapuri',
    name: 'Totapuri Mangoes',
    subtitle: 'The Parrot-Beak Mango',
    price: 46,
    weight: '3.1 kg gross · 2.8 kg net',
    pieces: '~10 pcs/box',
    origin: 'Karnataka & Tamil Nadu',
    description: 'Named for its distinctive parrot-beak shape. Mild, tangy-sweet flavour with firm flesh — perfect for eating fresh or making aamras.',
    emoji: '🥭',
    highlights: ['Tangy-Sweet', 'Firm Texture', '~10 pcs/box'],
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'jumbo_kesar',
    name: 'Jumbo Kesar Mangoes',
    subtitle: 'Extra Large · Premium Grade',
    price: 45,
    weight: '3.1 kg gross · 2.8 kg net',
    pieces: '~9–10 pcs/box',
    origin: 'Gir, Gujarat',
    description: 'All the rich saffron sweetness of Kesar — in an extra-large size. Handpicked select-grade fruits for those who want the absolute best.',
    emoji: '🥭',
    highlights: ['Extra Large Size', 'Select Grade', '~9–10 pcs/box'],
    color: 'from-orange-400 to-red-500',
  },
]

const CITIES = [
  'Pickering', 'Ajax', 'Whitby', 'Oshawa',
  'Scarborough', 'Markham', 'North York', 'Toronto Downtown',
  'Mississauga', 'Brampton', 'Georgetown', 'Etobicoke', 'Caledon',
]

export default function Home() {
  const [cart, setCart] = useState({ kesar: 0, alphonso: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [deliveryDates, setDeliveryDates] = useState<string[]>([])
  const [siteSettings, setSiteSettings] = useState<Record<string, boolean>>({
    orders_open: true,
    kesar_open: true,
    alphonso_open: true,
    banganapalli_open: true,
    totapuri_open: true,
    jumbo_kesar_open: true,
  })
  const [settingsLoading, setSettingsLoading] = useState(true)

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<Order>()

  const kesarQty = watch('kesar_qty') || 0
  const alphonsoQty = watch('alphonso_qty') || 0
  const banganpalliQty = watch('banganapalli_qty') || 0
  const totapuriQty = watch('totapuri_qty') || 0
  const jumboKesarQty = watch('jumbo_kesar_qty') || 0
  const selectedCity = watch('city') || ''
  const courierMode = selectedCity === 'other'

  const total = courierMode
    ? (Number(kesarQty) * 55)
    : (Number(kesarQty) * 44) +
      (Number(alphonsoQty) * 46) +
      (Number(banganpalliQty) * 44) +
      (Number(totapuriQty) * 46) +
      (Number(jumboKesarQty) * 45)

  useEffect(() => {
    setDeliveryDates(getNextDeliveryDates())
    // Fetch all availability settings
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        setSiteSettings(prev => ({ ...prev, ...d }))
        setSettingsLoading(false)
      })
      .catch(() => setSettingsLoading(false))
  }, [])

  const onSubmit = async (data: Order) => {
    if (!siteSettings.orders_open) {
      toast.error('Orders are currently closed. Please check back soon.')
      return
    }
    const isCourierOrder = data.city === 'other'

    if (isCourierOrder) {
      if (Number(data.kesar_qty) === 0) {
        toast.error('Courier orders are Kesar only. Please add at least 1 box.')
        return
      }
    } else if (
      Number(data.kesar_qty) === 0 &&
      Number(data.alphonso_qty) === 0 &&
      Number(data.banganapalli_qty) === 0 &&
      Number(data.totapuri_qty) === 0 &&
      Number(data.jumbo_kesar_qty) === 0
    ) {
      toast.error('Please add at least one box to your order.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          kesar_qty: Number(data.kesar_qty) || 0,
          alphonso_qty: isCourierOrder ? 0 : (Number(data.alphonso_qty) || 0),
          banganapalli_qty: isCourierOrder ? 0 : (Number(data.banganapalli_qty) || 0),
          totapuri_qty: isCourierOrder ? 0 : (Number(data.totapuri_qty) || 0),
          jumbo_kesar_qty: isCourierOrder ? 0 : (Number(data.jumbo_kesar_qty) || 0),
          total_amount: total,
          order_type: isCourierOrder ? 'courier' : 'home_delivery',
          city: isCourierOrder ? (data.other_city || 'Other City') : data.city,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Something went wrong')
      setOrderSuccess(true)
      reset()
      toast.success('Order placed! Bhavin will contact you shortly. 🥭')
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fdf8ee' }}>
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(27,67,50,0.95)', borderBottom: '1px solid rgba(212,128,26,0.3)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <div className="font-display font-bold text-white text-lg leading-tight">Royal Maharaja</div>
              <div className="text-xs tracking-widest uppercase" style={{ color: '#f59e0b' }}>Mango</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#products" className="hidden sm:block text-sm text-white/80 hover:text-amber-400 transition-colors font-body">Products</a>
            <a href="#order" className="hidden sm:block text-sm text-white/80 hover:text-amber-400 transition-colors font-body">Order</a>
            <a
              href="#order"
              className="px-4 py-2 rounded text-sm font-bold transition-all hover:scale-105"
              style={{ backgroundColor: '#d4801a', color: 'white' }}
            >
              Order Now
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #081c15 0%, #1b4332 40%, #2d6a4f 70%, #40916c 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          {/* Gold leaf accents */}
          <div className="absolute top-20 left-10 text-6xl opacity-20 float-animation" style={{ animationDelay: '0s' }}>🥭</div>
          <div className="absolute top-40 right-16 text-4xl opacity-15 float-animation" style={{ animationDelay: '1s' }}>🌿</div>
          <div className="absolute bottom-32 right-10 text-5xl opacity-20 float-animation" style={{ animationDelay: '2s' }}>🥭</div>
          <div className="absolute bottom-20 left-16 text-3xl opacity-15 float-animation" style={{ animationDelay: '0.5s' }}>🌿</div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          {/* Crown + badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 fade-in-up" style={{ backgroundColor: 'rgba(212,128,26,0.2)', border: '1px solid rgba(212,128,26,0.5)', color: '#fbbf24', animationDelay: '0.1s' }}>
            🇮🇳 Fresh From Indian Orchards &nbsp;•&nbsp; GTA Delivery
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-7xl text-white leading-tight mb-4 fade-in-up" style={{ animationDelay: '0.2s' }}>
            Royal Maharaja<br />
            <span className="gold-shimmer italic">Mango</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl font-body mb-8 max-w-xl mx-auto fade-in-up" style={{ animationDelay: '0.4s' }}>
            Premium Kesar & Alphonso mangoes — handpicked from the orchards of Gujarat & Maharashtra, delivered fresh to your door.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10 fade-in-up" style={{ animationDelay: '0.5s' }}>
            {['🚚 Fri & Sat Delivery', '🏠 Home Delivery Only', '✅ Farm-Direct Fresh'].map(tag => (
              <span key={tag} className="px-4 py-2 rounded-full text-sm font-body" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up" style={{ animationDelay: '0.6s' }}>
            <a
              href="#order"
              className="px-8 py-4 rounded font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #b45309, #d97706)', boxShadow: '0 4px 24px rgba(212,128,26,0.4)' }}
            >
              Order Now — Limited Stock
            </a>
            <a
              href="#products"
              className="px-8 py-4 rounded font-bold text-amber-300 text-lg border border-amber-400/40 hover:bg-amber-400/10 transition-all"
            >
              View Products ↓
            </a>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fdf8ee" />
          </svg>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="py-8 texture-bg" style={{ borderBottom: '1px solid rgba(212,128,26,0.2)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🏅', label: 'Premium Quality', sub: 'Export Grade' },
              { icon: '✈️', label: 'Air Freighted', sub: 'Farm to Door' },
              { icon: '📦', label: 'Carefully Packed', sub: 'Arrives Fresh' },
              { icon: '🌟', label: 'Trusted by GTA', sub: 'Indian Families' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <span className="text-3xl">{item.icon}</span>
                <div className="font-display font-semibold text-sm" style={{ color: '#1b4332' }}>{item.label}</div>
                <div className="text-xs text-gray-500 font-body">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-accent text-2xl mb-2" style={{ color: '#d4801a' }}>This Season's Finest</p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl" style={{ color: '#1b4332' }}>
              Our Mangoes
            </h2>
            <div className="ornament mt-4 max-w-xs mx-auto">
              <span className="text-amber-500 text-xl">✦</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl overflow-hidden shadow-xl border transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ backgroundColor: 'white', borderColor: 'rgba(212,128,26,0.2)' }}
              >
                {/* Product color header */}
                <div className={`bg-gradient-to-r ${product.color} p-8 text-center relative`}>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/30">
                    {product.origin}
                  </div>
                  <div className="text-6xl mb-2">{product.emoji}</div>
                  <div className="font-accent text-white/80 text-lg">{product.subtitle}</div>
                  <div className="font-display font-bold text-white text-3xl">{product.name}</div>
                </div>

                <div className="p-6">
                  <p className="font-body text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {product.highlights.map(h => (
                      <span key={h} className="px-3 py-1 rounded-full text-xs font-body font-bold" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                        ✓ {h}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t" style={{ borderColor: 'rgba(212,128,26,0.15)' }}>
                    <div>
                      <div className="text-xs font-body text-gray-400 mb-0.5">{product.weight}</div>
                      {product.pieces && <div className="text-xs font-body text-gray-400 mb-1">{product.pieces}</div>}
                      <div className="font-display font-bold text-3xl" style={{ color: '#1b4332' }}>
                        ${product.price} <span className="text-base font-body text-gray-400 font-normal">CAD / box</span>
                      </div>
                    </div>
                    <a
                      href="#order"
                      className="px-5 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)' }}
                    >
                      Order →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DELIVERY INFO ── */}
      <section className="py-16 px-4" style={{ backgroundColor: '#1b4332' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">Delivery Information</h2>
          <p className="font-accent text-amber-400 text-xl mb-10">We bring the orchard to your doorstep</p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: '📅', title: 'Delivery Days', desc: 'Every Friday & Saturday only' },
              { icon: '🏠', title: 'Home Delivery', desc: 'No pickup — we come to you' },
              { icon: '📍', title: 'Coverage Area', desc: 'Across Greater Toronto Area' },
            ].map(item => (
              <div key={item.title} className="p-6 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,128,26,0.3)' }}>
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="font-display font-semibold text-white text-lg mb-1">{item.title}</div>
                <div className="font-body text-white/60 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="font-body text-amber-400 text-sm font-bold tracking-widest uppercase mb-4">Delivery Cities</div>
            <div className="flex flex-wrap justify-center gap-2">
              {CITIES.map(city => (
                <span
                  key={city}
                  className="px-4 py-1.5 rounded-full text-sm font-body text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ORDER FORM ── */}
      <section id="order" className="py-20 px-4 texture-bg">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-accent text-2xl mb-2" style={{ color: '#d4801a' }}>Reserve Your Box</p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl" style={{ color: '#1b4332' }}>
              Place Your Order
            </h2>
            <p className="font-body text-gray-500 mt-3 text-sm">
              Once you submit, Bhavin will reach out to confirm your delivery. Payment on delivery.
            </p>
          </div>

          {orderSuccess ? (
            <div className="text-center p-12 rounded-2xl shadow-xl" style={{ backgroundColor: 'white', border: '2px solid #d4801a' }}>
              <div className="text-6xl mb-4">🥭</div>
              <h3 className="font-display font-bold text-2xl mb-2" style={{ color: '#1b4332' }}>Order Received!</h3>
              <p className="font-body text-gray-600 mb-6">Bhavin will WhatsApp you within a few hours to confirm your delivery details. Thank you!</p>
              <button
                onClick={() => setOrderSuccess(false)}
                className="px-6 py-3 rounded-lg font-bold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}
              >
                Place Another Order
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'white', border: '1px solid rgba(212,128,26,0.2)' }}>
              {/* Form Header */}
              <div className="p-6" style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)' }}>
                <h3 className="font-display font-semibold text-white text-xl">Order Details</h3>
                <p className="font-body text-white/60 text-sm mt-1">All fields are required unless noted</p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Mango Selection */}
                <div>
                  <h4 className="font-display font-semibold text-lg mb-4" style={{ color: '#1b4332' }}>Select Your Mangoes</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {PRODUCTS.map(product => {
                      const settingKey = `${product.id}_open`
                      const varietyOff = siteSettings[settingKey] === false
                      const lockedOut = (courierMode && product.id !== 'kesar') || (!courierMode && varietyOff)
                      const courierPrice = courierMode && product.id === 'kesar'
                      return (
                        <div key={product.id} className="p-4 rounded-xl border transition-opacity" style={{ borderColor: 'rgba(212,128,26,0.25)', backgroundColor: lockedOut ? '#f5f5f5' : '#fffbeb', opacity: lockedOut ? 0.4 : 1 }}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-display font-semibold text-sm" style={{ color: '#1b4332' }}>{product.name}</div>
                              <div className="font-body text-xs text-gray-400">
                                ${courierPrice ? 55 : product.price} CAD / box{product.pieces ? ` · ${product.pieces}` : ''}
                                {courierPrice && <span className="ml-1 text-amber-600 font-bold">(courier)</span>}
                                {varietyOff && !courierMode && <span className="ml-1 font-bold" style={{ color: '#dc2626' }}>— Sold out</span>}
                              </div>
                            </div>
                            <span className="text-2xl">{product.emoji}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <label className="font-body text-xs text-gray-500">Qty:</label>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              defaultValue={0}
                              disabled={lockedOut}
                              className="w-20 px-3 py-2 rounded-lg border text-center font-body font-bold text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed"
                              style={{ borderColor: lockedOut ? '#d1d5db' : '#d4801a' }}
                              {...register(`${product.id}_qty` as any, { min: 0, max: 20 })}
                            />
                            <span className="font-body text-xs text-gray-400">boxes</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {/* Order summary */}
                  {total > 0 && (
                    <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#1b4332' }}>
                      <div className="font-body text-white/70 text-sm mb-2 space-y-0.5">
                        {courierMode ? (
                          Number(kesarQty) > 0 && <div>{kesarQty} × Kesar (Courier) = ${55 * Number(kesarQty)} CAD</div>
                        ) : (
                          <>
                            {Number(kesarQty) > 0 && <div>{kesarQty} × Kesar = ${44 * Number(kesarQty)} CAD</div>}
                            {Number(alphonsoQty) > 0 && <div>{alphonsoQty} × Alphonso = ${46 * Number(alphonsoQty)} CAD</div>}
                            {Number(banganpalliQty) > 0 && <div>{banganpalliQty} × Banganapalli = ${44 * Number(banganpalliQty)} CAD</div>}
                            {Number(totapuriQty) > 0 && <div>{totapuriQty} × Totapuri = ${46 * Number(totapuriQty)} CAD</div>}
                            {Number(jumboKesarQty) > 0 && <div>{jumboKesarQty} × Jumbo Kesar = ${45 * Number(jumboKesarQty)} CAD</div>}
                          </>
                        )}
                      </div>
                      <div className="font-display font-bold text-white text-xl border-t border-white/20 pt-2 mt-2">
                        Total: ${total} <span className="text-sm font-normal text-white/60">CAD</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block font-body font-bold text-sm mb-2" style={{ color: '#1b4332' }}>Delivery Date *</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                    {...register('delivery_date', { required: 'Please select a delivery date' })}
                  >
                    <option value="">Select a Friday or Saturday…</option>
                    {deliveryDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                  {errors.delivery_date && <p className="text-red-500 text-xs mt-1">{errors.delivery_date.message}</p>}
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-display font-semibold text-lg mb-4" style={{ color: '#1b4332' }}>Contact Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Full Name *</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                        {...register('customer_name', { required: 'Name is required' })}
                      />
                      {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Phone / WhatsApp *</label>
                        <input
                          type="tel"
                          placeholder="+1 (647) 000-0000"
                          className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('customer_phone', { required: 'Phone is required' })}
                        />
                        {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone.message}</p>}
                      </div>
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Email *</label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('customer_email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                        />
                        {errors.customer_email && <p className="text-red-500 text-xs mt-1">{errors.customer_email.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="font-display font-semibold text-lg mb-4" style={{ color: '#1b4332' }}>Delivery Address</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Street Address *</label>
                      <input
                        type="text"
                        placeholder="123 Main Street, Unit 4"
                        className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                        {...register('delivery_address', { required: 'Address is required' })}
                      />
                      {errors.delivery_address && <p className="text-red-500 text-xs mt-1">{errors.delivery_address.message}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>City *</label>
                        <select
                          className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('city', { required: 'Please select your city' })}
                        >
                          <option value="">Select city…</option>
                          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="other">📦 Other City (Courier)</option>
                        </select>
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Postal Code *</label>
                        <input
                          type="text"
                          placeholder="M1A 1A1"
                          className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('postal_code', { required: 'Postal code is required' })}
                        />
                        {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code.message}</p>}
                      </div>
                    </div>

                    {/* Other City text box — shown only when courier selected */}
                    {courierMode && (
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Your City *</label>
                        <input
                          type="text"
                          placeholder="e.g. Hamilton, Ottawa, Calgary…"
                          className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('other_city', { required: courierMode ? 'Please enter your city' : false })}
                        />
                        {(errors as any).other_city && <p className="text-red-500 text-xs mt-1">{(errors as any).other_city.message}</p>}
                      </div>
                    )}

                    {/* Courier notice banner */}
                    {courierMode && (
                      <div className="p-4 rounded-xl border-2" style={{ backgroundColor: '#fffbeb', borderColor: '#d4801a' }}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📦</span>
                          <div>
                            <div className="font-display font-bold text-sm mb-1" style={{ color: '#1b4332' }}>Courier Order</div>
                            <div className="font-body text-xs leading-relaxed" style={{ color: '#78350f' }}>
                              Courier orders are <strong>Kesar only</strong> at <strong>$55 CAD / box</strong> (includes shipping).
                              Bhavin will confirm delivery timeline via WhatsApp after you place the order.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Special Instructions <span className="font-normal text-gray-400">(optional)</span></label>
                      <textarea
                        rows={3}
                        placeholder="Apartment buzz code, best time to deliver, etc."
                        className="w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2 resize-none"
                        style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                        {...register('special_instructions')}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <div className="p-4 rounded-xl mb-4 text-sm font-body" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                    {courierMode
                      ? <>📦 <strong>Courier order</strong> — Bhavin will WhatsApp you to confirm shipping details and payment.</>
                      : <>💳 <strong>Payment on delivery</strong> — Bhavin will WhatsApp you to confirm your order and delivery window.</>
                    }
                  </div>
                  {settingsLoading ? (
                    <div className="w-full py-4 rounded-xl text-center font-body text-gray-400 text-sm" style={{ background: '#f3f4f6' }}>
                      Checking availability…
                    </div>
                  ) : !siteSettings.orders_open ? (
                    <div className="w-full py-4 rounded-xl text-center font-bold text-lg" style={{ background: '#fee2e2', color: '#991b1b', border: '2px solid #fca5a5' }}>
                      🚫 Orders are currently closed
                      <div className="text-sm font-normal mt-1" style={{ color: '#b91c1c' }}>
                        Please check back soon or DM us on Instagram
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #b45309)', boxShadow: '0 4px 20px rgba(212,128,26,0.4)' }}
                    >
                      {isSubmitting ? '⏳ Placing Order…' : '🥭 Place Order →'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-4 text-center" style={{ backgroundColor: '#081c15' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">👑</span>
            <div className="text-left">
              <div className="font-display font-bold text-white text-xl">Royal Maharaja Mango</div>
              <div className="font-body text-xs tracking-widest uppercase" style={{ color: '#f59e0b' }}>Premium Indian Mangoes</div>
            </div>
          </div>
          <p className="font-body text-white/40 text-sm mb-4">
            Authentic Kesar & Alphonso mangoes, straight from Indian orchards to your GTA home.
          </p>
          <div className="flex justify-center gap-6 text-sm font-body" style={{ color: '#d4801a' }}>
            <a href="https://www.instagram.com/royal_mango_worldwide" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              Instagram
            </a>
            <a href="mailto:shahbhavin2022@gmail.com" className="hover:text-amber-300 transition-colors">
              Email Us
            </a>
          </div>
          <p className="font-body text-white/20 text-xs mt-6">
            © {new Date().getFullYear()} Royal Maharaja Mango. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
