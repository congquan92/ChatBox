const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Ưu tiên:
 * 1) socket.handshake.auth.token
 * 2) Authorization: Bearer <token>
 */
function getTokenFromHandshake(handshake) {
    // 1) từ auth
    const t1 = handshake?.auth?.token;
    if (typeof t1 === "string" && t1.trim()) return t1.trim();

    // 2) từ header Authorization
    const authHeader = handshake?.headers?.authorization || handshake?.headers?.Authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7).trim();
    }

    return null;
}

function socketAuth(socket, next) {
    try {
        const token = getTokenFromHandshake(socket.handshake);
        if (!token) {
            // giống “No token provided”
            return next(new Error("No token provided"));
        }

        // verify giống authenticateToken
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                // giống “Forbidden access”
                return next(new Error("Forbidden access - Không có quyền truy cập"));
            }
            // gán user để các handler sau dùng
            socket.user = user; // { id, username, email, iat, exp, ... }  được jwt giải ra
            return next();
        });
    } catch (e) {
        return next(new Error("Invalid token"));
    }
}

module.exports = { socketAuth };
