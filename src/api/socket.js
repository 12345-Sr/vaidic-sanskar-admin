import { io } from 'socket.io-client';
import { BASE_URL } from './client';

const resolveSocketUrl = () => {
  if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
    return BASE_URL.replace(/\/api\/admin\/?$/, '').replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.port === '5173' ? 'http://localhost:4000' : window.location.origin;
  }
  return '/';
};

const socketUrl = resolveSocketUrl();

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
