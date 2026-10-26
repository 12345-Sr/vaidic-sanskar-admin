import { io } from 'socket.io-client';
import { BASE_URL } from './client';

const socketUrl = BASE_URL.replace(/\/api\/admin\/?$/, '').replace(/\/api\/?$/, '') || 'http://localhost:4000';

class AdminSocket {
  constructor() {
    this.socket = null;
    this.init();
  }

  init() {
    try {
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        auth: { role: 'admin' },
        query: { role: 'admin' },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('[AdminSocket] Connected to real-time server:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[AdminSocket] Disconnected:', reason);
      });
    } catch (err) {
      console.warn('[AdminSocket] Failed to init socket:', err);
    }
  }

  on(event, callback) {
    if (!this.socket) return () => {};
    this.socket.on(event, callback);
    return () => {
      this.socket.off(event, callback);
    };
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const adminSocket = new AdminSocket();
export default adminSocket;
