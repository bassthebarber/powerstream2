// backend/routes/gramRoutes.js
import { Router } from "express";
import {
  getGrams,
  createGram,
  getGramById,
  updateGram,
  deleteGram,
  likeGram,
  getGramComments,
  commentOnGram,
} from "../controllers/gramController.js";
import { authRequired, authOptional } from "../middleware/requireAuth.js";

const router = Router();

// Basic health check
router.get("/health", (req, res) => res.json({ ok: true, service: "gram" }));

router.get("/", authOptional, getGrams);
router.post("/", authRequired, createGram);
router.get("/:id", authOptional, getGramById);
router.put("/:id", authRequired, updateGram);
router.delete("/:id", authRequired, deleteGram);

// Likes
router.post("/:id/like", authRequired, likeGram);

// Comments
router.get("/:id/comments", authRequired, getGramComments);
router.post("/:id/comments", authRequired, commentOnGram);

export default router;
