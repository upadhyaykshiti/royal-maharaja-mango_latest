// import { Client, LocalAuth } from 'whatsapp-web.js'
// import qrcode from 'qrcode-terminal'

// declare global {
//   // eslint-disable-next-line no-var
//   var whatsappClient: Client | undefined
// }

// let isInitializing = false

// const client =
//   global.whatsappClient ||
//   new Client({
//     authStrategy: new LocalAuth({
//       clientId: 'royal-maharaja-mango',
//     }),
//     puppeteer: {
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     },
//   })

// if (!global.whatsappClient) {
//   client.on('qr', (qr) => {
//     console.log('\n📱 Scan this QR with WhatsApp:\n')
//     qrcode.generate(qr, { small: true })
//   })

//   client.on('ready', () => {
//     console.log('✅ WhatsApp client ready!')
//   })

//   client.on('authenticated', () => {
//     console.log('🔐 WhatsApp authenticated')
//   })

//   client.on('auth_failure', (msg) => {
//     console.error('❌ Auth failure:', msg)
//   })

// //   client.initialize()
//     if (!global.whatsappClient && !isInitializing) {
//   isInitializing = true

//   client.initialize()

//   global.whatsappClient = client
// }

//   global.whatsappClient = client
// }

// export async function sendWhatsApp(message: string) {
//   try {
//     const phone = process.env.WHATSAPP_PHONE

//     if (!phone) {
//       console.warn('WHATSAPP_PHONE missing')
//       return
//     }

//     const chatId = `${phone}@c.us`

//     await client.sendMessage(chatId, message)

//     console.log('✅ WhatsApp message sent')
//   } catch (err) {
//     console.error('❌ WhatsApp send error:', err)
//   }
// }



import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'

declare global {
  // eslint-disable-next-line no-var
  var whatsappClient: Client | undefined
  // eslint-disable-next-line no-var
  var whatsappReady: boolean | undefined
}

global.whatsappReady = global.whatsappReady || false

let isInitializing = false

const client =
  global.whatsappClient ||
  new Client({
    authStrategy: new LocalAuth({
      clientId: 'royal-maharaja-mango',
    }),
    puppeteer: {
      headless: false,
      executablePath:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    },
  })

if (!global.whatsappClient && !isInitializing) {
  isInitializing = true

  console.log('🚀 Initializing WhatsApp client...')

  client.on('qr', (qr) => {
    console.log('\n📱 Scan this QR with WhatsApp:\n')
    qrcode.generate(qr, { small: true })
  })

  client.on('authenticated', () => {
    console.log('🔐 WhatsApp authenticated')
  })

  client.on('ready', () => {
    console.log('✅ WhatsApp client ready!')
    global.whatsappReady = true
  })

  client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp disconnected:', reason)
    global.whatsappReady = false
  })

  client.initialize()

  global.whatsappClient = client
}

// export async function sendWhatsApp(message: string) {
//   try {
//     if (!global.whatsappReady) {
//       console.warn('⚠️ WhatsApp not ready yet')
//       return
//     }

//     const phone = process.env.WHATSAPP_PHONE

//     if (!phone) {
//       console.warn('⚠️ WHATSAPP_PHONE missing')
//       return
//     }

//     const chatId = `${phone}@c.us`

//     await client.sendMessage(chatId, message)

//     console.log('✅ WhatsApp message sent')
//   } catch (err) {
//     console.error('❌ WhatsApp send error:', err)
//   }
// }

