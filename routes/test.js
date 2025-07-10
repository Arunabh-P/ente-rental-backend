import express from 'express';
const router = express.Router();
router.get('/test',(req,res)=>{res.send('refetch render api')})
export default router
