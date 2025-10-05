const express = require("express");
const http = require("http");

require("dotenv").config();
const app = express();
const server = http.createServer(app);

const pool = require("./config/db");
const PORT = process.env.PORT;

// Socket.io setup
const { initializeSocket } = require("./socket/chatSocket");
const io = initializeSocket(server);

// import routes
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const conversationRoutes = require("./routes/conversation.routes");
const messageRoutes = require("./routes/message.routes");

// middlewares
app.use(express.json());

// Make io accessible to req object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// routes
app.use("/auth", authRoutes); // /login , /register
app.use("/profile", profileRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "ChatBox API is running",
        timestamp: new Date().toISOString(),
        status: "healthy",
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found", status: 404 });
});

// Error handler
app.use((error, req, res, next) => {
    console.error("Global error handler:", error);
    res.status(500).json({
        message: "Internal server error",
        status: 500,
        ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
});

// start server
pool.getConnection()
    .then((connection) => {
        console.log("Connected to MySQL database");
        connection.release();

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Socket.IO server is ready for connections`);
            console.log(`Health check available at http://localhost:${PORT}/health`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MySQL database:", error);
        process.exit(1);
    });
