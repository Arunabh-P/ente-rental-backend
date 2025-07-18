import express from "express";
import { getUserProfile, loginUser, registerUser, updateUser, veryfyNextAuthToken } from "../controller/user.js";
export const router = express.Router();

router.post("/register",  registerUser);
router.post("/login", loginUser);
router.get("/profile", veryfyNextAuthToken,getUserProfile);
router.put("/profile", veryfyNextAuthToken,updateUser);


export default router;
