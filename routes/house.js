import express from 'express';
import { createHouse, getHouseByID, getHouses, updateHouseById } from '../controller/house.js';

const router = express.Router();

router.post('/create', createHouse)
router.get('/', getHouses); 
router.get("/:id", getHouseByID)
router.put('/:id',updateHouseById)

export default router