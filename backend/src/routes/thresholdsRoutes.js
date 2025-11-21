import express from "express";
import { ThresholdsController } from "../controllers/thresholdsController.js";
import { requireAuth } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.get("/", ThresholdsController.list);
router.get("/latest", ThresholdsController.latest);

// Route yang diproteksi
router.put("/", requireAuth, ThresholdsController.create); 
router.delete("/:id", requireAuth, ThresholdsController.delete);

// ==================================================
// BARIS INI YANG HILANG DARI FILE ANDA:
// ==================================================
export default router;