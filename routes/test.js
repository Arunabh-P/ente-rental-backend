import express from 'express';
const router = express.Router();
router.get('/test',()=>{res.send('refetch render api')})
export default router
