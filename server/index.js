const express = require("express");

require("dotenv").config();
const app = express();

const pool = require("./config/db");
const PORT = process.env.PORT;

// import
const authRoutes = require("./routes/auth.routes");

// middlewares
app.use(express.json());

// routes
app.use("/auth", authRoutes); // /login , /register

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found", status: 404 });
});

// start server
pool.getConnection()
    .then((connection) => {
        console.log("Connected to MySQL database");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MySQL database:", error);
    });
