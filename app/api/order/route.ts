export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// import { sendWhatsApp } from '@/lib/whatsapp'
// import { sendWhatsApp } from '@/lib/whatsapp-send'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      city,
      postal_code,
      kesar_qty,
      alphonso_qty,
      total_amount,
      delivery_date,
      special_instructions,
    } = body

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !delivery_address || !city || !postal_code || !delivery_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (kesar_qty === 0 && alphonso_qty === 0) {
      return NextResponse.json({ error: 'Please select at least one box' }, { status: 400 })
    }

    // Save to Supabase
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        city,
        postal_code,
        kesar_qty,
        alphonso_qty,
        total_amount,
        delivery_date,
        special_instructions: special_instructions || null,
        status: 'pending',
      }])
      .select()
      .single()

    if (dbError) {
      console.error('Supabase error:', dbError)
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
    }

    // Build order summary text
    const orderLines = []
    if (kesar_qty > 0) orderLines.push(`${kesar_qty} × Kesar ($${kesar_qty * 44} CAD)`)
    if (alphonso_qty > 0) orderLines.push(`${alphonso_qty} × Alphonso ($${alphonso_qty * 46} CAD)`)

    const orderSummary = orderLines.join('\n')

    const messageText = `🥭 *New Royal Maharaja Mango Order!*

*Customer:* ${customer_name}
*Phone:* ${customer_phone}
*Email:* ${customer_email}
*Address:* ${delivery_address}, ${city}, ${postal_code}

*Order:*
${orderSummary}
*Total:* $${total_amount} CAD

*Delivery Date:* ${delivery_date}
${special_instructions ? `*Notes:* ${special_instructions}` : ''}

Please confirm with the customer on WhatsApp. 🙏`

    // Send WhatsApp via CallMeBot
    // await sendWhatsApp(messageText)
    // await fetch('https://whatsapproal-maharaj-mango-production.up.railway.app/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     message: messageText,
    //   }),
    // })
    await fetch(
      'https://whatsapproal-maharaj-mango-production.up.railway.app/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: '16478898529',
          // phone: '917600028233',
          message: messageText,
        }),
      }
    )

    // Send Email notification
    await sendEmail({
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      address: `${delivery_address}, ${city}, ${postal_code}`,
      orderSummary,
      total: total_amount,
      deliveryDate: delivery_date,
      notes: special_instructions,
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err: any) {
    console.error('Order API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// async function sendWhatsApp(message: string) {
//   try {
//     const phone = process.env.WHATSAPP_PHONE // e.g. 16478895292
//     const apiKey = process.env.WHATSAPP_API_KEY // from callmebot.com
//     if (!phone || !apiKey) {
//       console.warn('WhatsApp not configured — skipping')
//       return
//     }
//     const encoded = encodeURIComponent(message)
//     const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`
//     const res = await fetch(url)
//     if (!res.ok) console.warn('WhatsApp send failed:', await res.text())
//   } catch (e) {
//     console.warn('WhatsApp error:', e)
//   }
// }

async function sendEmail(params: {
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  orderSummary: string
  total: number
  deliveryDate: string
  notes?: string
}) {
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.warn('Resend not configured — skipping email')
      return
    }

    const html = `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; border: 2px solid #d4801a; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #1b4332, #2d6a4f); padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Royal Maharaja Mango</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0;">New Order Received!</p>
  </div>
  <div style="padding: 28px; background: #fffbeb;">
    <h2 style="color: #1b4332; border-bottom: 1px solid #d4801a; padding-bottom: 8px;">Customer Details</h2>
    <p><strong>Name:</strong> ${params.customerName}</p>
    <p><strong>Phone / WhatsApp:</strong> ${params.customerPhone}</p>
    <p><strong>Email:</strong> ${params.customerEmail}</p>

    <h2 style="color: #1b4332; border-bottom: 1px solid #d4801a; padding-bottom: 8px; margin-top: 20px;">Order Summary</h2>
    <pre style="background: #f9f4e8; padding: 12px; border-radius: 6px; font-family: monospace;">${params.orderSummary}</pre>
    <p style="font-size: 18px; color: #1b4332;"><strong>Total: $${params.total} CAD</strong></p>

    <h2 style="color: #1b4332; border-bottom: 1px solid #d4801a; padding-bottom: 8px; margin-top: 20px;">Delivery Info</h2>
    <p><strong>Date:</strong> ${params.deliveryDate}</p>
    <p><strong>Address:</strong> ${params.address}</p>
    ${params.notes ? `<p><strong>Notes:</strong> ${params.notes}</p>` : ''}
  </div>
  <div style="background: #1b4332; padding: 16px; text-align: center;">
    <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">Royal Maharaja Mango · shahbhavin2022@gmail.com</p>
  </div>
</div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['shahbhavin2022@gmail.com'],
        subject: `🥭 New Order — ${params.customerName} — $${params.total} CAD`,
        html,
      }),
    })
    const data = await res.json()

    console.log('RESEND STATUS:', res.status)
    console.log('RESEND DATA:', data)

    if (!res.ok) console.warn('Resend email failed:', await res.text())
  } catch (e) {
    console.warn('Email error:', e)
  }
}
