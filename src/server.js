require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://highway-delite-frontend-three.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => res.send("API OK"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));

const start = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Server start error:", err.message);
    process.exit(1);
  }
};
start();
