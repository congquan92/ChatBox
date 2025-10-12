import { io } from "socket.io-client";

//URL server socket
const URL_SOCKET = import.meta.env.VITE_SOCKET_URL;

export const socket = io(URL_SOCKET, {
    autoConnect: true,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    auth: { token: localStorage.getItem("token") }, // nếu dùng JWT
});
