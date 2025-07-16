import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { superAdmin } from "../middleware/superAdmin.js";
import {
  authDetails,
  createAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
} from "../controller/admin.js";
export const router = express.Router();

router.post("/create-admin", protect, superAdmin, createAdmin);
router.post("/login", loginAdmin);
router.post("/refresh-token", refreshAdminToken);
router.get("/auth-details", authDetails);
router.post("/logout", logoutAdmin);


export default router;
