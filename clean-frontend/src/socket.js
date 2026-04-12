import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  `${window.location.protocol}//${window.location.host}`;

const SOCKET_PATH =
  import.meta.env.VITE_SOCKET_PATH?.replace(/\/+$/, "") || "/socket.io";

export const socket = io(SOCKET_URL, {
  path: SOCKET_PATH,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("✅ Socket connected as", socket.id);
});
socket.on("connect_error", (err) => {
  console.error("❌ Socket connect_error:", err?.message || err);
});

export default socket;
