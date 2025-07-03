import express from 'express';
import { createHouse } from '../controller/house.js';

const router = express.Router();

router.post('/create',createHouse)

export default router