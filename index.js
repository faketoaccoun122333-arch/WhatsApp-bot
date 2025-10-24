const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')

const store = makeInMemoryStore({ logger: undefined })
store.readFromFile('./store.json')
setInterval(() => {
  store.writeToFile('./store.json')
}, 10_000)

async function startBot() {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state
  })

  store.bind(sock.ev)
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason === DisconnectReason.loggedOut) {
        console.log('❌ Terlogout, scan ulang QR')
        startBot()
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

    const text = msg.message.conversation?.toLowerCase() || ''
    const sender = msg.key.remoteJid

    if (text.includes('hai')) {
      await sock.sendMessage(sender, { text: 'Hai juga 😘' })
    } else if (text.includes('sayang')) {
      await sock.sendMessage(sender, { text: 'Aku juga sayang kamu 😍' })
    } else if (text.includes('rindu')) {
      await sock.sendMessage(sender, { text: 'Aku juga rindu kamu 🥺 Jangan lama-lama ya~' })
    }
  })
}

startBot()
