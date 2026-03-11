import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { registerConnectionHandlers } from './handlers/connectionHandler'
import { registerLobbyHandlers } from './handlers/lobbyHandler'
import { registerGameHandlers } from './handlers/gameHandler'
import { registerBlindGuessHandlers } from './handlers/blindGuessHandler'

const app = express()
const httpServer = createServer(app)

const NEXT_ORIGIN = process.env.NEXT_ORIGIN || 'http://localhost:3000'

const io = new Server(httpServer, {
  cors: {
    origin: [NEXT_ORIGIN, 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use(cors({ origin: NEXT_ORIGIN }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

io.on('connection', (socket) => {
  registerConnectionHandlers(io, socket)
  registerLobbyHandlers(io, socket)
  registerGameHandlers(io, socket)
  registerBlindGuessHandlers(io, socket)
})

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket server running on http://localhost:${PORT}`)
})
