import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = "https://safe-rho-ivory.vercel.app";

let latestSnapshot = null;

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

app.post("/data", (req, res) => {
  latestSnapshot = req.body;
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).json({ success: true });
});

app.get("/data", (req, res) => {
  if (!latestSnapshot) {
    return res.status(200).json({
      message: "No data received yet",
    });
  }

  res.status(200).json(latestSnapshot);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
