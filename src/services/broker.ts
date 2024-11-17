import Aedes from "aedes"
import logger from "../utils/logger"
const broker = new Aedes()

broker.on("client", (client) => {
    logger.info(`[${client.id}] A new client connected!`)
})

broker.on("publish", (packet, client) => {
    if(!client?.id) return
    logger.info(`[${client?.id}] (${packet.topic}) qos: ${packet.qos} payload: ${packet.payload.toString()}`)
})

broker.on("subscribe", (client) => {
    logger.info(client)
})

export default broker