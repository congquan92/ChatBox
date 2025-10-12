import { useContext } from "react";
import { SocketContext } from "@/context/SocketContext";

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket phải được sử dụng trong SocketProvider");
    }
    return context;
};
