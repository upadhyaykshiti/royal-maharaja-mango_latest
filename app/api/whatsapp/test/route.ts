import { sendWhatsApp } from '@/lib/whatsapp'

export async function GET() {
  await sendWhatsApp('✅ WhatsApp test successful')

  return Response.json({ success: true })
}