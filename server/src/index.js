require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",             // allow any origin during dev
    methods: ["GET", "POST", "PUT", "DELETE"]
  },
});


const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Make io available to routes
app.set("io", io);

// Connect DB
connectDB(process.env.MONGO_URI);

// Routes
app.get("/", (req, res) => {
  res.send("🌍 Disaster Management Backend Running");
});
app.use("/api/emergencies", require("./routes/emergencies.js")); // <— our CRUD routes

// Socket.IO
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// after app.set("io", io) and before emergencies route
app.use("/api/auth", require("./routes/auth.js"));

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
