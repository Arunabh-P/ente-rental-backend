import jwt from "jsonwebtoken";

export const generateAccessToken = (data, secret, expiresIn) => {
  if (!data || !secret || !expiresIn) return null;
  return jwt.sign(
    { id: data._id, email: data.email, role: data.role },
    secret,
    { expiresIn: expiresIn }
  );
};