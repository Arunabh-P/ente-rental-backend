import expressAsyncHandler from "express-async-handler";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response-utils.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/token.js";
import { clearCookie, setCookie } from "../utils/cookie.js";

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

  const existingUser = await User.findOne({ email: normalizedEmail });
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
  const accessToken = generateAccessToken(user, process.env.JWT_SECRET, "15m");
  const refreshToken = generateAccessToken(
    user,
    process.env.JWT_REFRESH_SECRET,
    "7d"
  );
  setCookie(res, "accessToken", accessToken, 15 * 60 * 1000);
  setCookie(res, "refreshToken", refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days

  sendSuccessResponse(res, StatusCodes.OK, "Login successful", {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

export const refreshUserToken = expressAsyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "Refresh token is required"
    );
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Invalid token format"
      );
    }
    const newAccessToken = generateAccessToken(
      user,
      process.env.JWT_SECRET,
      "15m"
    );
    const newRefreshToken = generateAccessToken(
      user,
      process.env.JWT_REFRESH_SECRET,
      "7d"
    );
    setCookie(res, "accessToken", newAccessToken, 15 * 60 * 1000);
    setCookie(res, "refreshToken", newRefreshToken, 7 * 24 * 60 * 60 * 1000);
    sendSuccessResponse(res, StatusCodes.OK, "Token refreshed successfully");
  } catch (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      error?.message || "Invalid or expired token"
    );
  }
});

export const authenticateUser = expressAsyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  if (!token && !refreshToken) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "No token provided",
      null,
      "NO_TOKEN"
    );
  }
  if (!token) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "No token provided"
    );
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      error?.message||"Invalid or expired token"
    );
  }
});

export const getUserProfile = expressAsyncHandler(async (req, res) => {
  const user = req.user;
  sendSuccessResponse(res, StatusCodes.OK, "Profile fetched successfully", {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});
export const logoutUser = expressAsyncHandler(async (req, res) => {
  clearCookie(res, "accessToken");
  clearCookie(res, "refreshToken");
  sendSuccessResponse(
    res,
    StatusCodes.OK,
    "You have been logged out of Ente Rentals"
  );
});
