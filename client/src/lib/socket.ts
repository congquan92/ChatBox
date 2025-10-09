import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
    autoConnect: true,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    // auth: { token: localStorage.getItem("token") }, // nếu dùng JWT
});
