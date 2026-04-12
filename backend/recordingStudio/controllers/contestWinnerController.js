// backend/recordingStudio/controllers/contestWinnerController.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage location
const DATA_DIR = path.join(__dirname, "../../exports");
const DATA_FILE = path.join(DATA_DIR, "contest-winners.json");

// Ensure folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load previous winners or create empty file
function loadWinners() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function saveWinners(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==========================================
// Add a contest winner
// ==========================================
export const addContestWinner = async (req, res) => {
  try {
    const { contestName, winnerName, prize, trackUrl } = req.body;

    if (!contestName || !winnerName) {
      return res.status(400).json({ error: "Missing winner information" });
    }

    const winners = loadWinners();

    const newEntry = {
      id: Date.now(),
      contestName,
      winnerName,
      prize: prize || "N/A",
      trackUrl: trackUrl || null,
      timestamp: new Date().toISOString(),
    };

    winners.push(newEntry);
    saveWinners(winners);

    res.json({
      message: "Contest winner saved",
      winner: newEntry,
    });
  } catch (err) {
    console.error("addContestWinner error:", err);
    res.status(500).json({ error: "Failed to save contest winner" });
  }
};

// ==========================================
// Get all contest winners
// ==========================================
export const getContestWinners = async (req, res) => {
  try {
    const winners = loadWinners();

    res.json({
      message: "Contest winners loaded",
      data: winners,
    });
  } catch (err) {
    console.error("getContestWinners error:", err);
    res.status(500).json({ error: "Failed to load contest winners" });
  }
};

// ==========================================
// Reset contest winner list
// ==========================================
export const resetContestWinners = async (req, res) => {
  try {
    saveWinners([]);

    res.json({
      message: "All contest winners have been reset",
    });
  } catch (err) {
    console.error("resetContestWinners error:", err);
    res.status(500).json({ error: "Failed to reset contest data" });
  }
};
