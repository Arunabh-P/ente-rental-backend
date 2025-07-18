import expressAsyncHandler from "express-async-handler";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response-utils.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import jwt from "jsonwebtoken";


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

export const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "Email and password are required"
    );
  }
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Invalid credentials"
    );
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Invalid credentials"
    );
  }
  sendSuccessResponse(res, StatusCodes.OK, "Login successful", {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

export const veryfyNextAuthToken = expressAsyncHandler(
  async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "No token provided"
      );
    }
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token.process.env.NEXTAUTH_SECRET);
      const userId = decoded.user?.id || decoded.sub;
      if (!userId) {
        return sendErrorResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          "Invalid token format"
        );
      }
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return sendErrorResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          "User not found"
        );
      }
      req.user = user;
      next();
    } catch (error) {
      return sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Invalid or expired token"
      );
    }
  }
);

export const getUserProfile = expressAsyncHandler(async (req, res) => {
  sendSuccessResponse(res, StatusCodes.OK, "Profile fetched successfully", {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});
export const updateUser = expressAsyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user._id;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name },
    { new: true, runValidators: true }
  ).select("-password");
  if (!updatedUser) {
    return sendErrorResponse(res, StatusCodes.NOT_FOUND, "User not found");
  }
  sendSuccessResponse(res, StatusCodes.OK, "Profile updated successfully", {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

