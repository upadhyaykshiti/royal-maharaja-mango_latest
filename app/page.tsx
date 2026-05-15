'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getNextDeliveryDates } from '@/lib/dates'
import { Order } from '@/lib/supabase'
import { FaInstagram, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import Image from 'next/image'
import logo from '../public/logo.png'


const PRODUCTS = [
  {
    id: 'kesar',
    name: 'Kesar Mangoes',
    subtitle: 'The Queen of Mangoes',
    price: 44,
    weight: '3 kg gross · 2.8 kg net',
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
    origin: 'Ratnagiri, Maharashtra',
    description: 'India\'s most celebrated mango. Buttery smooth, non-fibrous with a rich, creamy texture and intoxicating fragrance.',
    emoji: '🥭',
    highlights: ['Creamy Texture', 'GI Tagged', 'Exotic Fragrance'],
    color: 'from-yellow-500 to-amber-600',
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

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<Order>()

  const kesarQty = watch('kesar_qty') || 0
  const alphonsoQty = watch('alphonso_qty') || 0
  const total = (Number(kesarQty) * 44) + (Number(alphonsoQty) * 46)

  useEffect(() => {
    setDeliveryDates(getNextDeliveryDates())
  }, [])

  const onSubmit = async (data: Order) => {
    if (Number(data.kesar_qty) === 0 && Number(data.alphonso_qty) === 0) {
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
          alphonso_qty: Number(data.alphonso_qty) || 0,
          total_amount: total,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Something went wrong')
      setOrderSuccess(true)
      reset()
      toast.success('Order placed! Bhavin Shah will contact you shortly. 🥭')
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fdf8ee' }}>
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 z-50 w-full backdrop-blur-md" style={{ backgroundColor: 'rgba(27,67,50,0.95)', borderBottom: '1px solid rgba(212,128,26,0.3)' }}>
        <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto">
          <div className="flex items-center gap-3">
            {/* <span className="text-2xl">👑</span> */}
            <Image
                src={logo}
                alt="Royal Maharaja Mango Logo"
                width={50}
                height={50}
                className="object-contain"
              />
            <div>
              <div className="text-lg font-bold leading-tight text-white font-display">Royal Maharaja</div>
              <div className="text-xs tracking-widest uppercase" style={{ color: '#f59e0b' }}>Mango</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#products" className="hidden text-sm transition-colors sm:block text-white/80 hover:text-amber-400 font-body">Products</a>
            <a href="#order" className="hidden text-sm transition-colors sm:block text-white/80 hover:text-amber-400 font-body">Order</a>
            <a
              href="#order"
              className="px-4 py-2 text-sm font-bold transition-all rounded hover:scale-105"
              style={{ backgroundColor: '#d4801a', color: 'white' }}
            >
              Order Now
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative flex items-center justify-center min-h-screen overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #081c15 0%, #1b4332 40%, #2d6a4f 70%, #40916c 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute rounded-full -top-40 -right-40 w-96 h-96 opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          <div className="absolute rounded-full -bottom-20 -left-20 w-80 h-80 opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          {/* Gold leaf accents */}
          <div className="absolute text-6xl top-20 left-10 opacity-20 float-animation" style={{ animationDelay: '0s' }}>🥭</div>
          <div className="absolute text-4xl top-40 right-16 opacity-15 float-animation" style={{ animationDelay: '1s' }}>🌿</div>
          <div className="absolute text-5xl bottom-32 right-10 opacity-20 float-animation" style={{ animationDelay: '2s' }}>🥭</div>
          <div className="absolute text-3xl bottom-20 left-16 opacity-15 float-animation" style={{ animationDelay: '0.5s' }}>🌿</div>
        </div>

        <div className="relative z-10 max-w-4xl px-4 pt-20 mx-auto text-center">
          {/* Crown + badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 fade-in-up" style={{ backgroundColor: 'rgba(212,128,26,0.2)', border: '1px solid rgba(212,128,26,0.5)', color: '#fbbf24', animationDelay: '0.1s' }}>
            🇮🇳 Fresh From Indian Orchards &nbsp;•&nbsp; GTA Delivery
          </div>

          <h1 className="mb-4 text-5xl font-bold leading-tight text-white font-display sm:text-7xl fade-in-up" style={{ animationDelay: '0.2s' }}>
            Royal Maharaja<br />
            <span className="italic gold-shimmer">Mango</span>
          </h1>

          <p className="max-w-xl mx-auto mb-8 text-lg text-white/70 sm:text-xl font-body fade-in-up" style={{ animationDelay: '0.4s' }}>
            Premium Kesar & Alphonso mangoes — handpicked from the orchards of Gujarat & Maharashtra, delivered fresh to your door.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10 fade-in-up" style={{ animationDelay: '0.5s' }}>
            {['🚚 Fri & Sat Delivery', '🏠 Home Delivery Only', '✅ Farm-Direct Fresh'].map(tag => (
              <span key={tag} className="px-4 py-2 text-sm rounded-full font-body" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row fade-in-up" style={{ animationDelay: '0.6s' }}>
            <a
              href="#order"
              className="px-8 py-4 text-lg font-bold text-white transition-all rounded hover:scale-105 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #b45309, #d97706)', boxShadow: '0 4px 24px rgba(212,128,26,0.4)' }}
            >
              Order Now — Limited Stock
            </a>
            <a
              href="#products"
              className="px-8 py-4 text-lg font-bold transition-all border rounded text-amber-300 border-amber-400/40 hover:bg-amber-400/10"
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
        <div className="max-w-5xl px-4 mx-auto">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {[
              { icon: '🏅', label: 'Premium Quality', sub: 'Export Grade' },
              { icon: '✈️', label: 'Air Freighted', sub: 'Farm to Door' },
              { icon: '📦', label: 'Carefully Packed', sub: 'Arrives Fresh' },
              { icon: '🌟', label: 'Trusted by GTA', sub: 'Indian Families' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <span className="text-3xl">{item.icon}</span>
                <div className="text-sm font-semibold font-display" style={{ color: '#1b4332' }}>{item.label}</div>
                <div className="text-xs text-gray-500 font-body">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="mb-2 text-2xl font-accent" style={{ color: '#d4801a' }}>This Season's Finest</p>
            <h2 className="text-4xl font-bold font-display sm:text-5xl" style={{ color: '#1b4332' }}>
              Our Mangoes
            </h2>
            <div className="max-w-xs mx-auto mt-4 ornament">
              <span className="text-xl text-amber-500">✦</span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden transition-all border shadow-xl rounded-2xl hover:-translate-y-1 hover:shadow-2xl"
                style={{ backgroundColor: 'white', borderColor: 'rgba(212,128,26,0.2)' }}
              >
                {/* Product color header */}
                <div className={`bg-gradient-to-r ${product.color} p-8 text-center relative`}>
                  <div className="absolute px-3 py-1 text-xs font-bold text-white border rounded-full top-4 right-4 bg-white/20 backdrop-blur-sm border-white/30">
                    {product.origin}
                  </div>
                  <div className="mb-2 text-6xl">{product.emoji}</div>
                  <div className="text-lg font-accent text-white/80">{product.subtitle}</div>
                  <div className="text-3xl font-bold text-white font-display">{product.name}</div>
                </div>

                <div className="p-6">
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 font-body">{product.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {product.highlights.map(h => (
                      <span key={h} className="px-3 py-1 text-xs font-bold rounded-full font-body" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                        ✓ {h}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t" style={{ borderColor: 'rgba(212,128,26,0.15)' }}>
                    <div>
                      <div className="mb-1 text-xs text-gray-400 font-body">{product.weight}</div>
                      <div className="text-3xl font-bold font-display" style={{ color: '#1b4332' }}>
                        ${product.price} <span className="text-base font-normal text-gray-400 font-body">CAD / box</span>
                      </div>
                    </div>
                    <a
                      href="#order"
                      className="px-5 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)' }}
                    >
                      Order Now →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DELIVERY INFO ── */}
      <section className="px-4 py-16" style={{ backgroundColor: '#1b4332' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-2 text-3xl font-bold text-white font-display sm:text-4xl">Delivery Information</h2>
          <p className="mb-10 text-xl font-accent text-amber-400">We bring the orchard to your doorstep</p>

          <div className="grid gap-6 mb-10 sm:grid-cols-3">
            {[
              { icon: '📅', title: 'Delivery Days', desc: 'Every Friday & Saturday only' },
              { icon: '🏠', title: 'Home Delivery', desc: 'No pickup — we come to you' },
              { icon: '📍', title: 'Coverage Area', desc: 'Across Greater Toronto Area' },
            ].map(item => (
              <div key={item.title} className="p-6 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,128,26,0.3)' }}>
                <div className="mb-3 text-4xl">{item.icon}</div>
                <div className="mb-1 text-lg font-semibold text-white font-display">{item.title}</div>
                <div className="text-sm font-body text-white/60">{item.desc}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-4 text-sm font-bold tracking-widest uppercase font-body text-amber-400">Delivery Cities</div>
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
      <section id="order" className="px-4 py-20 texture-bg">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 text-center">
            <p className="mb-2 text-2xl font-accent" style={{ color: '#d4801a' }}>Reserve Your Box</p>
            <h2 className="text-4xl font-bold font-display sm:text-5xl" style={{ color: '#1b4332' }}>
              Place Your Order
            </h2>
            <p className="mt-3 text-sm text-gray-500 font-body">
              Once you submit, Bhavin Shah will reach out to confirm your delivery details and payment. We can\'t wait to get these delicious mangoes to you!
            </p>
          </div>

          {orderSuccess ? (
            <div className="p-12 text-center shadow-xl rounded-2xl" style={{ backgroundColor: 'white', border: '2px solid #d4801a' }}>
              <div className="mb-4 text-6xl">🥭</div>
              <h3 className="mb-2 text-2xl font-bold font-display" style={{ color: '#1b4332' }}>Order Received!</h3>
              <p className="mb-6 text-gray-600 font-body">Bhavin shah will WhatsApp you within a few hours to confirm your delivery details. Thank you!</p>
              <button
                onClick={() => setOrderSuccess(false)}
                className="px-6 py-3 font-bold text-white transition-all rounded-lg hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}
              >
                Place Another Order
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="overflow-hidden shadow-2xl rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid rgba(212,128,26,0.2)' }}>
              {/* Form Header */}
              <div className="p-6" style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)' }}>
                <h3 className="text-xl font-semibold text-white font-display">Order Details</h3>
                <p className="mt-1 text-sm font-body text-white/60">All fields are required unless noted</p>
              </div>

              <div className="p-6 space-y-6 sm:p-8">
                {/* Mango Selection */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold font-display" style={{ color: '#1b4332' }}>Select Your Mangoes</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {PRODUCTS.map(product => (
                      <div key={product.id} className="p-4 border rounded-xl" style={{ borderColor: 'rgba(212,128,26,0.25)', backgroundColor: '#fffbeb' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-sm font-semibold font-display" style={{ color: '#1b4332' }}>{product.name}</div>
                            <div className="text-xs text-gray-400 font-body">${product.price} CAD / box</div>
                          </div>
                          <span className="text-2xl">{product.emoji}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <label className="text-xs text-gray-500 font-body">Qty:</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            defaultValue={0}
                            className="w-20 px-3 py-2 text-sm font-bold text-center border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-[#d4801a]"
                            style={{ borderColor: '#d4801a' }}
                            // className="w-20 px-3 py-2 text-sm font-bold text-center border rounded-lg font-body focus:outline-none focus:ring-2"
                            // style={{ borderColor: '#d4801a', focusRingColor: '#d4801a' }}
                            {...register(product.id === 'kesar' ? 'kesar_qty' : 'alphonso_qty', { min: 0, max: 20 })}
                          />
                          <span className="text-xs text-gray-400 font-body">boxes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Order summary */}
                  {total > 0 && (
                    <div className="flex items-center justify-between p-4 mt-4 rounded-xl" style={{ backgroundColor: '#1b4332' }}>
                      <div className="text-sm font-body text-white/70">
                        {kesarQty > 0 && <span>{kesarQty} × Kesar ${44 * Number(kesarQty)} </span>}
                        {alphonsoQty > 0 && <span>{alphonsoQty} × Alphonso ${46 * Number(alphonsoQty)}</span>}
                      </div>
                      <div className="text-xl font-bold text-white font-display">
                        Total: ${total} <span className="text-sm font-normal text-white/60">CAD</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block mb-2 text-sm font-bold font-body" style={{ color: '#1b4332' }}>Delivery Date *</label>
                  <select
                    className="w-full px-4 py-3 text-sm border rounded-lg font-body focus:outline-none focus:ring-2"
                    style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                    {...register('delivery_date', { required: 'Please select a delivery date' })}
                  >
                    <option value="">Select a Saturday/Sunday delivery...</option>
                    {/* {deliveryDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))} */}
                    {deliveryDates.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                  {errors.delivery_date && <p className="mt-1 text-xs text-red-500">{errors.delivery_date.message}</p>}
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold font-display" style={{ color: '#1b4332' }}>Contact Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Full Name *</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        className="w-full px-4 py-3 text-sm border rounded-lg font-body focus:outline-none focus:ring-2"
                        style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                        {...register('customer_name', { required: 'Name is required' })}
                      />
                      {errors.customer_name && <p className="mt-1 text-xs text-red-500">{errors.customer_name.message}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Phone / WhatsApp *</label>
                        <input
                          type="tel"
                          placeholder="+1 (647) 000-0000"
                          className="w-full px-4 py-3 text-sm border rounded-lg font-body focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('customer_phone', { required: 'Phone is required' })}
                        />
                        {errors.customer_phone && <p className="mt-1 text-xs text-red-500">{errors.customer_phone.message}</p>}
                      </div>
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Email *</label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 text-sm border rounded-lg font-body focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('customer_email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                        />
                        {errors.customer_email && <p className="mt-1 text-xs text-red-500">{errors.customer_email.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold font-display" style={{ color: '#1b4332' }}>Delivery Address</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Street Address *</label>
                      <input
                        type="text"
                        placeholder="123 Main Street, Unit 4"
                        className="w-full px-4 py-3 text-sm border rounded-lg font-body focus:outline-none focus:ring-2"
                        style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                        {...register('delivery_address', { required: 'Address is required' })}
                      />
                      {errors.delivery_address && <p className="mt-1 text-xs text-red-500">{errors.delivery_address.message}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>City *</label>
                        <select
                          className="w-full px-4 py-3 text-sm border rounded-lg font-body focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('city', { required: 'Please select your city' })}
                        >
                          <option value="">Select city…</option>
                          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Postal Code *</label>
                        <input
                          type="text"
                          placeholder="M1A 1A1"
                          className="w-full px-4 py-3 text-sm border rounded-lg font-body focus:outline-none focus:ring-2"
                          style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                          {...register('postal_code', { required: 'Postal code is required' })}
                        />
                        {errors.postal_code && <p className="mt-1 text-xs text-red-500">{errors.postal_code.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block font-body font-bold text-sm mb-1.5" style={{ color: '#1b4332' }}>Special Instructions <span className="font-normal text-gray-400">(optional)</span></label>
                      <textarea
                        rows={3}
                        placeholder="Apartment buzz code, best time to deliver, etc."
                        className="w-full px-4 py-3 text-sm border rounded-lg resize-none font-body focus:outline-none focus:ring-2"
                        style={{ borderColor: 'rgba(212,128,26,0.4)' }}
                        {...register('special_instructions')}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <div className="p-4 mb-4 text-sm rounded-xl font-body" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                    💳 <strong>Payment</strong> — Bhavin Shah will WhatsApp you to confirm your order and delivery window.
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #b45309)', boxShadow: '0 4px 20px rgba(212,128,26,0.4)' }}
                  >
                    {isSubmitting ? '⏳ Placing Order…' : '🥭 Place Order →'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-4 py-12 text-center" style={{ backgroundColor: '#081c15' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">👑</span>
            <div className="text-left">
              <div className="text-xl font-bold text-white font-display">Royal Maharaja Mango</div>
              <div className="text-xs tracking-widest uppercase font-body" style={{ color: '#f59e0b' }}>Premium Indian Mangoes</div>
            </div>
          </div>
          <p className="mb-4 text-sm font-body text-white/40">
            Authentic Kesar & Alphonso mangoes, straight from Indian orchards to your GTA home.
          </p>
          {/* <div className="flex justify-center gap-6 text-sm font-body" style={{ color: '#d4801a' }}>
            <a href="https://www.instagram.com/royal_mango_worldwide" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber-300">
              Instagram
            </a>
            <a href="mailto:shahbhavin2022@gmail.com" className="transition-colors hover:text-amber-300">
              Email Us
            </a>
          </div> */}

          <div
            className="flex justify-center gap-6 text-2xl"
            style={{ color: "#d4801a" }}
          >
            {/* Instagram */}
            <a
              href="https://www.instagram.com/royal_mango_worldwide"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-amber-300"
            >
              <FaInstagram />
            </a>

            {/* Email */}
            {/* <a
              href="mailto:shahbhavin2022@gmail.com"
              className="transition-colors hover:text-amber-300"
            >
              <FaEnvelope />
            </a> */}

            {/* WhatsApp */}
            <a
              href="https://wa.me/16478898529"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-amber-300"
            >
              <FaWhatsapp />
            </a>
          </div>
          <p className="mt-6 text-xs font-body text-white/20">
            © {new Date().getFullYear()} Royal Maharaja Mango. All rights reserved.
          </p>
          <p className="mt-2 text-xs font-body text-white/40">
              Website designed & maintained by{" "}
              <a
                href="mailto:ukshiti@gmail.com"
                className="text-yellow-400 transition hover:text-yellow-300"
              >
                ukshiti@gmail.com
              </a>
            </p>
        </div>
      </footer>
    </main>
  )
}
