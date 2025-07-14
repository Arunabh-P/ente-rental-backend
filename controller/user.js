import expressAsyncHandler from "express-async-handler";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response-utils.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";

export const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "All fields are required"
    );
  }
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ normalizedEmail });
  if (existingUser) {
    return sendErrorResponse(res, StatusCodes.CONFLICT, "User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
  });
  await newUser.save();
  sendSuccessResponse(res, StatusCodes.CREATED, "Registered successfully", {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
  });
});
