// backend/routes/musicGenRoutes.js
// MusicGen API Routes - AI Music Generation
// Prefix: /api/musicgen

import express from "express";

const router = express.Router();

// Check if MusicGen API is configured
const MUSICGEN_API_BASE = process.env.MUSICGEN_API_BASE || process.env.REPLICATE_API_URL;
const MUSICGEN_API_KEY = process.env.MUSICGEN_API_KEY || process.env.REPLICATE_API_TOKEN;
const AI_CONFIGURED = !!(MUSICGEN_API_BASE && MUSICGEN_API_KEY);

/**
 * Health check
 * GET /api/musicgen/health
 */
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "MusicGen API",
    aiConfigured: AI_CONFIGURED,
    fallbackMode: !AI_CONFIGURED,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Generate music/beat using AI
 * POST /api/musicgen/generate
 * Body: {
 *   prompt: string,        // e.g., "trap beat with heavy 808s"
 *   duration?: number,     // seconds (default: 10)
 *   temperature?: number,  // creativity 0-1 (default: 0.7)
 *   bpm?: number,         // beats per minute (default: 120)
 *   key?: string,         // musical key (default: "C minor")
 *   genre?: string        // genre hint (default: "trap")
 * }
 */
router.post("/generate", async (req, res) => {
  try {
    const {
      prompt,
      duration = 10,
      temperature = 0.7,
      bpm = 120,
      key = "C minor",
      genre = "trap",
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "prompt is required",
      });
    }

    console.log(`🎵 [MusicGen] Generating: "${prompt}" (${duration}s, ${bpm} BPM)`);

    // If AI is configured, call the API
    if (AI_CONFIGURED) {
      try {
        const response = await fetch(`${MUSICGEN_API_BASE}/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MUSICGEN_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: `${prompt}, ${bpm} BPM, ${key}, ${genre} style`,
            duration,
            temperature,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI API returned ${response.status}`);
        }

        const data = await response.json();

        return res.json({
          ok: true,
          audioUrl: data.audio_url || data.output,
          prompt,
          duration,
          bpm,
          key,
          genre,
          source: "musicgen-ai",
          generatedAt: new Date().toISOString(),
        });
      } catch (aiError) {
        console.warn("⚠️ [MusicGen] AI API failed, using fallback:", aiError.message);
        // Fall through to fallback
      }
    }

    // Fallback: Return a demo/placeholder response
    // In production, you could serve pre-generated beats from a library
    const fallbackId = `beat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    res.json({
      ok: true,
      beatId: fallbackId,
      audioUrl: null, // No actual audio in fallback mode
      pattern: generateDrumPattern(genre),
      prompt,
      duration,
      bpm,
      key,
      genre,
      source: "fallback-pattern",
      message: AI_CONFIGURED 
        ? "AI generation failed, pattern returned" 
        : "AI not configured, pattern returned. Set MUSICGEN_API_BASE and MUSICGEN_API_KEY in .env",
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ [MusicGen] Error:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Music generation failed",
    });
  }
});

/**
 * Get available genres/styles
 * GET /api/musicgen/styles
 */
router.get("/styles", (_req, res) => {
  res.json({
    ok: true,
    styles: [
      { id: "trap", name: "Trap", bpmRange: [130, 160] },
      { id: "drill", name: "Drill", bpmRange: [135, 145] },
      { id: "hiphop", name: "Hip-Hop", bpmRange: [80, 110] },
      { id: "rnb", name: "R&B", bpmRange: [60, 90] },
      { id: "lofi", name: "Lo-Fi", bpmRange: [70, 90] },
      { id: "boom-bap", name: "Boom Bap", bpmRange: [85, 100] },
      { id: "afrobeat", name: "Afrobeat", bpmRange: [100, 130] },
      { id: "reggaeton", name: "Reggaeton", bpmRange: [90, 100] },
    ],
    moods: ["dark", "hype", "chill", "emotional", "aggressive", "uplifting"],
  });
});

/**
 * Generate a simple drum pattern (fallback when AI is not available)
 */
function generateDrumPattern(genre = "trap") {
  const patterns = {
    trap: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      openHat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    },
    drill: {
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      perc: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    },
    hiphop: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    },
    rnb: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    lofi: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
    },
  };

  return patterns[genre] || patterns.trap;
}

export default router;










