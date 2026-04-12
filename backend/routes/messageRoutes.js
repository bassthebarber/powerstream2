import { Router } from "express";
import { authOptional, authRequired } from "../middleware/requireAuth.js";
import {
  listMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/messageController.js";

const router = Router();

router.get("/", authOptional, listMessages);
router.post("/", authRequired, createMessage);
router.get("/:id", authOptional, getMessageById);
router.put("/:id", authRequired, updateMessage);
router.delete("/:id", authRequired, deleteMessage);

export default router;
