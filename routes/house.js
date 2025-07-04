import express from 'express';
import { createHouse, getHouseByID, getHouses, updateHouseById } from '../controller/house.js';

const router = express.Router();

router.post('/create', createHouse)
router.get('/', getHouses); ///api/house?search=delhi&priceMin=5000&priceMax=15000&bedrooms=2&page=1&limit=5
router.get("/:id", getHouseByID)
router.put('/:id',updateHouseById)

export default router