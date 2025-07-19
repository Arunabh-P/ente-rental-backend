import jwt from "jsonwebtoken";
import { sendErrorResponse } from "../utils/response-utils.js";
import { StatusCodes } from "http-status-codes";
import Admin from '../models/admin.js'
export const protect = async (req,res,next)=>{
   let token = req.headers.authorization?.split(" ")[1];
   if (!token) {
    return sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "No token, access denied");
  }
   try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Admin not found");
    }

    req.admin = admin; 
    next();
  } catch (err) {
    return sendErrorResponse(res, StatusCodes.UNAUTHORIZED, err?.message || "Invalid token");
  }

}