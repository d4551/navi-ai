// Socket.io client setup
import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001', {
      transports: ['websocket'],
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default getSocket
