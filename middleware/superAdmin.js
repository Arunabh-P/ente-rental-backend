import { StatusCodes } from "http-status-codes";
import { sendErrorResponse } from "../utils/response-utils.js";

export const superAdmin = (req, res, next) => {
  if (req.user.role != "superAdmin") {
    return sendErrorResponse(
      res,
      StatusCodes.FORBIDDEN,
      "Super admin access only"
    );
  }
  next();
};
