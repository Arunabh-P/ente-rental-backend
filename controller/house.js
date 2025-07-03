import expressAsyncHandler from "express-async-handler";
import House from "../models/house.js";
import { StatusCodes } from "http-status-codes";
import { createHouseValidation } from "../validation/house.js";
import { sendResponse } from "../utils/response-utils.js";

export const createHouse = expressAsyncHandler(async (req, res) => {
    const { error } = createHouseValidation.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
            message: "Validation failed",
            errors: error.details.map((err) => err.message),
        });
    }
    const house = new House(req.body)
    await house.save();
    sendResponse(res, StatusCodes.CREATED, "House details added successfully");
})

export const getHouses = expressAsyncHandler(async (req, res) => {
    const { search, priceMin,
        priceMax, propertyType, furnishing,
        bachelorsAllowed,
        carParking,
        bedrooms,
        bathrooms, page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc" } = req.query
    const query = {};

    if (search) {
        query.$or = [
            { title: new RegExp(search, "i") },
            { description: new RegExp(search, "i") },
            { location: new RegExp(search, "i") },
        ]
    }
    if (priceMin || priceMax) {
        query.price = {};
        if (priceMin) query.price.$gte = Number(priceMin);
        if (priceMax) query.price.$lte = Number(priceMax)
    }
    if (propertyType) query.propertyType = propertyType
    if (furnishing) query.furnishing = furnishing
    if (bachelorsAllowed !== undefined) query.bachelorsAllowed = BachelorsAllowed === "true";
    if (carParking !== undefined) query.CarParking = carParking === "true";
    if (bedrooms) query.Bedrooms = Number(bedrooms);
    if (bathrooms) query.Bathrooms = Number(bathrooms);

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Count total for pagination
    const total = await House.countDocuments(query);

    const houses = await House.find(query)
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(Number(limit));
        
    sendResponse(res, StatusCodes.OK, "Houses fetched successfully", {
        houses,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
    });

})