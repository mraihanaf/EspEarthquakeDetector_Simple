import makeWASocket, { DisconnectReason, BufferJSON, useMultiFileAuthState } from '@whiskeysockets/baileys'
import logger from '../utils/logger'
import { Boom } from '@hapi/boom'
import broker from './broker'

async function connectToWhatsapp() {
    logger.info("connecting to whatsapp")
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info")
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        // @ts-ignore
        logger: logger 
    })

    sock.ev.on("creds.update", saveCreds)
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update
        if(connection === "close"){
            if(!lastDisconnect) return logger.fatal("logger connect undefined")
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            if(shouldReconnect) {
                logger.error('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
                logger.info("reconnecting to whatsapp")
                connectToWhatsapp()
            }
        } else if(connection === "open"){
            logger.info("opened connection")
        }
    })

    sock.ev.on("messages.upsert", async (Messages) => {
        logger.info(Messages)


    })

    broker.on("publish", (packet, _client) => {
        if(packet.topic === "esp/earthquake"){
            sock.sendMessage("6281238981143@s.whatsapp.net", { text: "Gempa jir" })
        }
    })
}

export default connectToWhatsapp