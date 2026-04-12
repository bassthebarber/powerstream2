// backend/routes/feedRoutes.js
import { Router } from "express";
import {
  getFeed,
  createPost,
  getFeedPostById,
  updateFeedPost,
  deleteFeedPost,
  toggleLike,
  getComments,
  addComment,
} from "../controllers/feedController.js";
import { authRequired, authOptional } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", authOptional, getFeed);
router.post("/", authRequired, createPost);
router.get("/:id", authOptional, getFeedPostById);
router.put("/:id", authRequired, updateFeedPost);
router.delete("/:id", authRequired, deleteFeedPost);

// Likes
router.post("/:id/like", authRequired, toggleLike);

// Comments
router.get("/:id/comments", authRequired, getComments);
router.post("/:id/comments", authRequired, addComment);

export default router;
