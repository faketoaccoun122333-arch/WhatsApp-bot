const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys')
const { state, saveState } = useSingleFileAuthState('./session.json')

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveState)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation || ''
    const sender = msg.key.remoteJid

    if (text.toLowerCase().includes('hai')) {
      await sock.sendMessage(sender, { text: 'Hai juga 😄' })
    }
  })
}

startBot()
