import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

const router = Router();

router.post("/", createNotification);
router.put("/:id/read", requireAuth, markAsRead);
router.get("/:userId", requireAuth, getUserNotifications);

export default router;
