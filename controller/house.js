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