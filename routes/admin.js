import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { superAdmin } from "../middleware/superAdmin.js";
import { createAdmin, loginAdmin, refreshAdminToken } from "../controller/admin.js";
export const router = express.Router();

router.post("/create-admin", protect, superAdmin, createAdmin);
router.post("/login", loginAdmin);
router.post("/refresh-token", refreshAdminToken);


export default router;
