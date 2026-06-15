import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Real-time WebSockets require a persistent server (local dev / Railway / Render).
// On Vercel serverless backend, VITE_REALTIME_ENABLED must be omitted or set to "false".
const REALTIME_ENABLED = import.meta.env.VITE_REALTIME_ENABLED === 'true';

export const useRealTime = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!REALTIME_ENABLED) return; // Serverless — skip gracefully

    const newSocket = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};
