import { createServer } from "net"
import logger from "./utils/logger"
import broker from "./services/broker"
import connectToWhatsapp from "./services/bot"
const server = createServer(broker.handle)

server.listen(process.env.PORT || 1883, () => {
    logger.info(`mqtt broker listening on port ${process.env.PORT || 1883}`)
})

connectToWhatsapp()