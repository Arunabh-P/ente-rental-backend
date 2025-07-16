import express from "express";
import { authUserDetails, loginUser, logoutUser, refreshUserToken, registerUser } from "../controller/user.js";
export const router = express.Router();

router.post("/register",  registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshUserToken);
router.get("/auth-details", authUserDetails);
router.post("/logout", logoutUser);

export default router;
