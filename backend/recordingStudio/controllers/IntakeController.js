// backend/recordingStudio/controllers/IntakeController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory
const uploadDir = path.join(__dirname, "../../uploads/intake");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Intake upload directory created:", uploadDir);
}

// File storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const cleanName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}-${cleanName}`);
    }
});

const upload = multer({ storage });

// =============================
// CONTROLLER LOGIC
// =============================

// Handle audio intake upload
export const handleIntakeUpload = [
    upload.single("audio"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No audio file uploaded" });
            }

            return res.json({
                message: "Audio intake file received",
                filename: req.file.filename,
                filepath: `/uploads/intake/${req.file.filename}`,
            });

        } catch (error) {
            console.error("❌ Intake upload error:", error);
            return res.status(500).json({ error: "Intake controller error" });
        }
    }
];

// Simple health test for recording studio
export const intakeHealth = (req, res) => {
    res.json({ status: "ok", controller: "IntakeController" });
};
