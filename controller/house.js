import expressAsyncHandler from 'express-async-handler';
import House from '../models/house.js';
import { StatusCodes } from 'http-status-codes';
import { createHouseValidation } from '../validation/house.js';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../utils/response-utils.js';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

export const createHouse = expressAsyncHandler(async (req, res) => {
  const { error } = createHouseValidation.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNPROCESSABLE_ENTITY,
      'Validation failed',
      error.details.map((err) => err.message)
    );
  }
  const { title, location } = req.body;

  let baseSlug = slugify(`${title}-${location}`, { lower: true, strict: true });

  let slug = baseSlug;
  let exists = await House.findOne({ slug });
  let count = 1;
  while (exists) {
    slug = `${baseSlug}-${count}`;
    exists = await House.findOne({ slug });
    count++;
    if (count > 10) {
      slug = `${baseSlug}-${uuidv4().slice(0, 8)}`;
      break;
    }
  }
  const house = new House({ ...req.body, slug });

  await house.save();
  sendSuccessResponse(
    res,
    StatusCodes.CREATED,
    'House details added successfully'
  );
});

export const getHouses = expressAsyncHandler(async (req, res) => {
  const {
    search,
    priceMin,
    priceMax,
    propertyType,
    furnishing,
    bachelorsAllowed,
    carParking,
    bedrooms,
    bathrooms,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    available,
  } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { location: new RegExp(search, 'i') },
    ];
  }
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) query.price.$lte = Number(priceMax);
  }
  if (propertyType) query.propertyType = propertyType;
  if (furnishing) query.furnishing = furnishing;
  if (carParking === 'true') query.carParking = true;
  if (bachelorsAllowed === 'true') query.bachelorsAllowed = true;
  if (available === 'true') query.available = true;

  if (bedrooms) query.bedrooms = Number(bedrooms);
  if (bathrooms) query.bathrooms = Number(bathrooms);

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Sort parsing
  let sortField = sortBy;
  let sortOrder = 1;
  if (sortBy.startsWith('-')) {
    sortField = sortBy.slice(1);
    sortOrder = -1;
  }

  // Count total for pagination
  const total = await House.countDocuments(query);

  const houses = await House.find(query)
    .select(
      'price location description title images propertyType furnishing bachelorsAllowed carParking slug'
    )
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(Number(limit));

  sendSuccessResponse(res, StatusCodes.OK, 'Houses fetched successfully', {
    houses,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

export const getHouseByID = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  // validate house id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendErrorResponse(res, StatusCodes.BAD_REQUEST, 'Invalid house ID');
  }

  const house = await House.findById(id);

  if (!house) {
    return sendErrorResponse(res, StatusCodes.NOT_FOUND, 'House not found');
  }
  sendSuccessResponse(
    res,
    StatusCodes.OK,
    'House details fetched successfully',
    house
  );
});

export const getHouseBySlug = expressAsyncHandler(async (req, res) => {
  const { slug } = req.params;

  const house = await House.findOne({ slug });

  if (!house) {
    return sendErrorResponse(res, StatusCodes.NOT_FOUND, 'House not found');
  }

  sendSuccessResponse(
    res,
    StatusCodes.OK,
    'House details fetched successfully',
    house
  );
});

export const updateHouseById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendErrorResponse(res, StatusCodes.BAD_REQUEST, 'Invalid house ID');
  }

  const { error } = createHouseValidation.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNPROCESSABLE_ENTITY,
      'Validation failed',
      error.details.map((err) => err.message)
    );
  }

  const updateHouse = await House.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updateHouse) {
    return sendErrorResponse(res, StatusCodes.NOT_FOUND, 'House not found');
  }
  sendSuccessResponse(
    res,
    StatusCodes.OK,
    'House updated successfully',
    updateHouse
  );
});

export const deleteHouseById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendErrorResponse(res, StatusCodes.BAD_REQUEST, 'Invalid house id');
  }
  const deleteHouse = await House.findByIdAndDelete(id);
  if (!deleteHouse) {
    return sendErrorResponse(res, StatusCodes.NOT_FOUND, 'House not found');
  }
  sendSuccessResponse(
    res,
    StatusCodes.OK,
    'House deleted successfully',
    deleteHouse
  );
});
