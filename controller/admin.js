import expressAsyncHandler from 'express-async-handler';
import Admin from '../models/admin.js';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../utils/response-utils.js';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/token.js';
import { clearCookie, setCookie } from '../utils/cookie.js';
export const createAdmin = expressAsyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      'All fields are required'
    );
  }
  const normalizedEmail = email.toLowerCase();

  if (req.user.role !== 'superAdmin') {
    return sendErrorResponse(
      res,
      StatusCodes.FORBIDDEN,
      'Only superAdmin can create admin users'
    );
  }
  if (!['admin', 'superAdmin'].includes(role)) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      'Role must be either admin or superAdmin'
    );
  }

  const existingAdmin = await Admin.findOne({ email: normalizedEmail });
  if (existingAdmin) {
    return sendErrorResponse(res, StatusCodes.CONFLICT, 'Admin already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = new Admin({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });
  await newAdmin.save();
  sendSuccessResponse(res, StatusCodes.CREATED, 'Admin created successfully', {
    id: newAdmin._id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role,
  });
});

export const loginAdmin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      'Email and password are required'
    );
  }
  const normalizedEmail = email.toLowerCase();
  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials'
    );
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials'
    );
  }
  if (!['admin', 'superAdmin'].includes(admin.role)) {
    return sendErrorResponse(res, StatusCodes.FORBIDDEN, 'Access denied');
  }
  const accessToken = generateAccessToken(admin, process.env.JWT_SECRET, '15m');
  const refreshToken = generateAccessToken(
    admin,
    process.env.JWT_REFRESH_SECRET,
    '7d'
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccessResponse(res, StatusCodes.OK, 'Login successful', {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
});

export const refreshAdminToken = expressAsyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      'Refresh token is required'
    );
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid refresh token'
      );
    }
    const newAccessToken = generateAccessToken(
      admin,
      process.env.JWT_SECRET,
      '15m'
    );
    const newRefreshToken = generateAccessToken(
      admin,
      process.env.JWT_REFRESH_SECRET,
      '7d'
    );
    setCookie(res, 'accessToken', newAccessToken, 15 * 60 * 1000);
    setCookie(res, 'refreshToken', newRefreshToken, 7 * 24 * 60 * 60 * 1000);
    sendSuccessResponse(res, StatusCodes.OK, 'Token refreshed successfully');
  } catch (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      error?.message || 'Invalid or expired refresh token'
    );
  }
});

export const authDetails = expressAsyncHandler(async (req, res) => {
  const token = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!token && !refreshToken) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'No token provided',
      null,
      'NO_TOKEN'
    );
  }
  if (!token) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'No token provided'
    );
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('id name email role');
    if (!admin) {
      return sendErrorResponse(res, StatusCodes.UNAUTHORIZED, 'User not found');
    }
    req.user = admin;
    sendSuccessResponse(res, StatusCodes.OK, 'Self data fetched successfully', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      error?.message || 'Invalid or expired token'
    );
  }
});

export const logoutAdmin = expressAsyncHandler(async (req, res) => {
  clearCookie(res, 'accessToken');
  clearCookie(res, 'refreshToken');
  sendSuccessResponse(
    res,
    StatusCodes.OK,
    'You have been logged out of Ente Rentals'
  );
});
