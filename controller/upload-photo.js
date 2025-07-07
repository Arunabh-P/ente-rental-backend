import expressAsyncHandler from 'express-async-handler';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response-utils.js';
import path from 'path';
import fs from 'fs';
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

  const filePath = path.resolve(file.path);

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 18,
            font_weight: 'bold',
            text: 'Ente%20Rental%20Kochi', 
          },
          gravity: 'center',
          width: 150,  
          opacity: 50 
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

    return sendSuccessResponse(res, StatusCodes.OK, 'Image uploaded successfully', {
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Image upload failed');
  }
});
