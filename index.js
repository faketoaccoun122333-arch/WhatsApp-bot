const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useSingleFileAuthState
} = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')

async function startBot() {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = useSingleFileAuthState('./store.json')

  const sock = makeWASocket({
    version,
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason === DisconnectReason.loggedOut) {
        console.log('❌ Terlogout, session tidak valid')
      } else {
        console.log('🔄 Koneksi terputus, reconnect...')
        startBot()
      }
    } else if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung!')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      ''

    const lowerText = text.toLowerCase()
    const sender = msg.key.remoteJid

    if (lowerText.includes('hai')) {
      await sock.sendMessage(sender, { text: 'Hai juga 😘' })
    } else if (lowerText.includes('sayang')) {
      await sock.sendMessage(sender, { text: 'Aku juga sayang kamu 😍' })
    } else if (lowerText.includes('rindu')) {
      await sock.sendMessage(sender, { text: 'Aku juga rindu kamu 🥺 Jangan lama-lama ya~' })
    }
  })
}

startBot()
