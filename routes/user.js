import express from 'express';
import {
  authenticateUser,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
} from '../controller/user.js';
export const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshUserToken);
router.get('/profile', authenticateUser, getUserProfile);
router.post('/logout', logoutUser);

export default router;
