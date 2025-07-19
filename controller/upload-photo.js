import expressAsyncHandler from 'express-async-handler';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../utils/response-utils.js';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';

export const uploadPhoto = expressAsyncHandler(async (req, res) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const file = req.file;
  const folder = req.folder || 'default-folder';

  if (!file) {
    return sendErrorResponse(res, StatusCodes.BAD_REQUEST, 'No file provided');
  }

  const filePath = file.path;

  try {
    const fileNameWithoutExt = path.parse(file.originalname).name;

    // Step 1: Upload non-watermarked image
    await cloudinary.uploader.upload(filePath, {
      folder: `${folder}/og-image`,
      public_id: `${fileNameWithoutExt}-original`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [
        {
          width: 800,
          height: 800,
          crop: 'limit',
          quality: 100,
        },
        {
          fetch_format: 'auto',
          quality: 'auto:best',
          dpr: '2.0',
        },
      ],
    });

    // Step 2: Upload watermarked version
    const watermarkedUpload = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: `${fileNameWithoutExt}-ente-rental-kochi`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 24,
            font_weight: 'bold',
            text: 'Ente%20Rental%20Kochi',
          },
          gravity: 'center',
          opacity: 30,
        },
        {
          width: 800,
          height: 800,
          crop: 'limit',
          quality: 100,
        },
        {
          fetch_format: 'auto',
          quality: 'auto:best',
          dpr: '2.0',
        },
      ],
    });

    fs.unlinkSync(filePath);

    return sendSuccessResponse(
      res,
      StatusCodes.OK,
      'Image uploaded successfully',
      {
        url: watermarkedUpload.secure_url,
        public_id: watermarkedUpload.public_id,
      }
    );
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Image upload failed'
    );
  }
});
