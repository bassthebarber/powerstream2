import { Router } from "express";
import {
  getPlaylist,
  postPlaylist,
  putPlaylist,
} from "../controllers/stationPlaylistController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router({ mergeParams: true });

router.get("/:id/playlist", getPlaylist);
router.post("/:id/playlist", requireAuth, postPlaylist);
router.put("/:id/playlist", requireAuth, putPlaylist);

export default router;
