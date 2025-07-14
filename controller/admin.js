import expressAsyncHandler from "express-async-handler";
import Admin from "../models/admin.js";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response-utils.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";

export const createAdmin = expressAsyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "All fields are required"
    );
  }
  const normalizedEmail = email.toLowerCase();

  if (req.user.role !== "superAdmin") {
    return sendErrorResponse(
      res,
      StatusCodes.FORBIDDEN,
      "Only superAdmin can create admin users"
    );
  }
  if (!["admin", "superAdmin"].includes(role)) {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "Role must be either admin or superAdmin"
    );
  }

  const existingAdmin = await Admin.findOne({ normalizedEmail });
  if (existingAdmin) {
    return sendErrorResponse(res, StatusCodes.CONFLICT, "Admin already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = new Admin({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });
  await newAdmin.save();
  sendSuccessResponse(res, StatusCodes.CREATED, "Admin created successfully", {
    id: newAdmin._id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role,
  });
});
