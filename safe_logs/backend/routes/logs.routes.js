import express from "express";
import { pool } from "../config/db.js";
import { generatePDF } from "../services/pdfService.js";

const router = express.Router();

// Get logs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Export PDF
router.get("/export", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50",
    );
    generatePDF(result.rows, res);
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
});

export default router;
