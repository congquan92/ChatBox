const express = require("express");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./socket/chatSocket");

require("dotenv").config();
const app = express();
const server = http.createServer(app);

const pool = require("./config/db");
const PORT = process.env.PORT;

// import
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const conversationRoutes = require("./routes/conversation.routes");
const messageRoutes = require("./routes/message.routes");
const receiptRoutes = require("./routes/receipt.routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// middlewares
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173", //  domain của FE
        credentials: true,
    })
);

// routes
app.use("/auth", authRoutes); // /login , /register
app.use("/profile", profileRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/receipts", receiptRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// start server
pool.getConnection()
    .then((connection) => {
        console.log("Connected to MySQL database");

        // Initialize Socket.io
        const io = initializeSocket(server);

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MySQL database:", error);
    });
