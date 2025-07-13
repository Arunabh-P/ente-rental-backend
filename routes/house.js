import express from 'express';
import { createHouse, deleteHouseById, getHouseByID, getHouseBySlug, getHouses, updateHouseById } from '../controller/house.js';

const router = express.Router();

router.post('/create', createHouse)
router.get('/', getHouses); 
router.get("/:id", getHouseByID)
router.get("/single/:slug", getHouseBySlug)
router.put('/:id',updateHouseById)
router.delete('/:id',deleteHouseById)


export default router