export async function sendWhatsApp(message: string) {
  try {
    const client = global.whatsappClient

    if (!client || !global.whatsappReady) {
      console.warn('⚠️ WhatsApp not ready')
      return
    }

    const phone = process.env.WHATSAPP_PHONE

    if (!phone) {
      console.warn('⚠️ WHATSAPP_PHONE missing')
      return
    }

    const chatId = `${phone}@c.us`

    await client.sendMessage(chatId, message)

    console.log('✅ WhatsApp message sent')
  } catch (err) {
    console.error('❌ WhatsApp send error:', err)
  }
}