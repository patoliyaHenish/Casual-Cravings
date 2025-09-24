import jwt from "jsonwebtoken";
import { handleAuthError, handleServerError } from "../utils/erroHandler.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return handleAuthError(res, "User not authenticated");
    }
    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return handleAuthError(res, "Invalid token");
    }
    req.id = decode.userId;
    req.user = decode;
    req.email = decode.email;
    req.role = decode.role;
    req.isAuthenticated = true;
    next();
  } catch (error) {
    handleServerError(res, error, "Authentication error");
  }
};
export default isAuthenticated;