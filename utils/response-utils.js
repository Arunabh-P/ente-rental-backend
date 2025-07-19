export const sendSuccessResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export const sendErrorResponse = (
  res,
  statusCode,
  message,
  errors = null,
  errorCode = null
) => {
  return res.status(statusCode).json({
    success: false,
    errorCode: errorCode,
    message,
    ...(errors && { errors }),
  });
};
