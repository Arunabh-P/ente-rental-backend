import expressAsyncHandler from "express-async-handler";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response-utils.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const generateUserAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};
const generateUserRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

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
  const accessToken = generateUserAccessToken(user);
  const refreshToken = generateUserRefreshToken(user);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
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
        "Invalid refresh token"
      );
    }
    const newAccessToken = generateUserAccessToken(user);
    const newRefreshToken = generateUserRefreshToken(user);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    sendSuccessResponse(res, StatusCodes.OK, "Token refreshed successfully");
  } catch (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired refresh token"
    );
  }
});

export const authUserDetails = expressAsyncHandler(async (req, res) => {
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
    const user = await User.findById(decoded.id).select("id name email role");
    if (!user) {
      return sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "User not found");
    }
    req.user = user;
    sendSuccessResponse(res, StatusCodes.OK, "Self data fetched successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired token"
    );
  }
});

export const logoutUser = expressAsyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  sendSuccessResponse(res, StatusCodes.OK, "You are logout from Ente Rentals");
});
