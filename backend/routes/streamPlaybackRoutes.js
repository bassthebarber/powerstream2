import { Router } from "express";
import { getStreamPlayback } from "../controllers/platformStationsController.js";

const router = Router();

router.get("/:slug", getStreamPlayback);

export default router;
