export const runtime = 'nodejs'

import '@/lib/whatsapp'

export async function GET() {
  return Response.json({
    success: true,
    message: 'WhatsApp initialized',
  })
}