const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')

async function startBot() {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

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
      console.log('✅ Bot berhasil login ke WhatsApp!')
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

    console.log('📨 Dari:', sender, '| Isi:', lowerText)

    // === Fungsi random balasan ===
    const randomReply = (arr) => arr[Math.floor(Math.random() * arr.length)]

    // ======== DAFTAR PERINTAH ========

    // 🌙 Salam & sapaan
    if (lowerText.includes('assalamualaikum')) {
      await sock.sendMessage(sender, { text: 'Waalaikumsalam wr.wb 🤲' })
    } else if (lowerText.includes('salam')) {
      await sock.sendMessage(sender, { text: 'Waalaikumsalam 🙏' })
    } else if (lowerText.includes('pagi')) {
      await sock.sendMessage(sender, { text: randomReply([
        'Selamat pagi 🌞 semoga harimu cerah!',
        'Pagi sayang~ udah sarapan belum? 😘',
        'Pagi juga ☕ semoga hari ini penuh senyum!'
      ])})
    } else if (lowerText.includes('malam')) {
      await sock.sendMessage(sender, { text: randomReply([
        'Selamat malam 🌙 mimpi indah ya~',
        'Malam sayang, peluk virtual dulu 🤗',
        'Met bobo 😴 semoga mimpiin aku hehe~'
      ])})
    }

    // 💞 Kata romantis & manja
    else if (['yank', 'yankk', 'syank', 'sayang', 'sayangku', 'beb', 'beby', 'bebz'].some(w => lowerText.includes(w))) {
      await sock.sendMessage(sender, { text: randomReply([
        'Iya sayangku 😘 ada apa nih?',
        'Kenapa panggil-panggil gitu 😚 kangen ya?',
        'Aku di sini kok, sayang 💞',
        'Iya bebkuu 😍 aku dengerin~',
        'Hehe iya cintaku 💖 kenapa sih lucu banget~'
      ])})
    } else if (lowerText.includes('rindu') || lowerText.includes('kangen')) {
      await sock.sendMessage(sender, { text: randomReply([
        'Aku juga rindu kamu 🥺 peluk dulu 🤗',
        'Kangen kamu tuh berat 😢',
        'Aku udah kangen duluan nih 😘',
        'Setiap detik gak chat kamu, rasanya kosong 😔'
      ])})
    } else if (lowerText.includes('peluk')) {
      await sock.sendMessage(sender, { text: randomReply([
        '🤗 Nih peluk erat dari jauh~',
        'Peluk balik sayang 😚',
        'Udah dipeluk, sekarang tenang ya 🩵'
      ])})
    } else if (lowerText.includes('cium')) {
      await sock.sendMessage(sender, { text: randomReply([
        '💋 muach~',
        'Cium balik 😘',
        'Ehehe malu nih 😳'
      ])})
    }

    // 😂 Lucu & santai
    else if (lowerText.includes('haha') || lowerText.includes('wkwk') || lowerText.includes('hehe')) {
      await sock.sendMessage(sender, { text: randomReply([
        'Haha 😆 kamu emang lucu banget sih~',
        'Wkwk ngakak juga aku 🤣',
        'Hehe ketawa bareng yuk 😁'
      ])})
    } else if (lowerText.includes('capek')) {
      await sock.sendMessage(sender, { text: randomReply([
        'Istirahat dulu ya 😴',
        'Jangan capek-capek sayang 🥺',
        'Sini aku pijitin virtual 💆‍♀️ hehe~'
      ])})
    } else if (lowerText.includes('lapar')) {
      await sock.sendMessage(sender, { text: randomReply([
        'Makan dulu gih 🍱 biar kuat!',
        'Laper? ayo makan bareng 😋',
        'Aku juga lapar nih, traktir dong 😝'
      ])})
    }

    // ✨ Kata random: "kata" / "kata-kata"
    else if (lowerText.includes('kata') || lowerText.includes('kata-kata')) {
      const quotes = [
        'Cinta itu kayak kopi ☕, kadang pahit tapi bikin nagih 😘',
        'Kamu itu kayak WiFi, dekat bikin tenang, jauh bikin hilang sinyal 😆',
        'Kalau aku bunga, kamu tuh mataharinya 🌻',
        'Cinta gak perlu alasan, cukup kamu 😍',
        'Aku bukan penyair, tapi tiap lihat kamu muncul kata-kata indah 😚',
        'Jangan senyum terus, aku bisa jatuh cinta dua kali 😜',
        'Kamu manis banget, gula aja kalah 🍬',
        'Cinta sejati tuh kayak chat ini — gak pernah aku hapus ❤️'
      ]
      await sock.sendMessage(sender, { text: randomReply(quotes) })
    }

    // 📋 Menu & info
    else if (lowerText.includes('ping')) {
      await sock.sendMessage(sender, { text: 'Pong! 🏓 aktif terus buat kamu 😘' })
    } else if (lowerText.includes('menu') || lowerText.includes('help')) {
      await sock.sendMessage(sender, {
        text: `✨ *Menu Bot Romantis* ✨
💞 Kata manja:
- sayang / yank / beb / syank / sayangku
😂 Candaan:
- haha / wkwk / capek / lapar / ngantuk
💌 Romantis:
- rindu / kangen / peluk / cium
💬 Random kata:
- ketik *kata* atau *kata-kata* untuk pesan romantis acak
🙏 Salam:
- assalamualaikum / pagi / malam
⚙️ Info:
- ping / menu / help
`
      })
    }

    // Default respon
    else {
      await sock.sendMessage(sender, {
        text: randomReply([
          'Hehe aku belum paham maksudmu 😅 coba ketik *menu* ya~',
          'Hmm maksudnya apa sayang? 😚',
          'Lucu juga kamu 😆 tapi aku belum ngerti 😅'
        ])
      })
    }
  })
}

startBot()
