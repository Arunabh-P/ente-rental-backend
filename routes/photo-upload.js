import express from 'express';
import multer from 'multer';
import { setUploadFolder } from '../utils/set-photo-upload-location.js';
import { uploadPhoto } from '../controller/upload-photo.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/house',setUploadFolder('ente-rental/development/house-images'), upload.single('file'), uploadPhoto);

export default router;
