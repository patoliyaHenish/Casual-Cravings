import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
       maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: true
    })
    .json({
      success: true,
      message,
      user,
    });
};

export const deleteToken = (res, message) => {
  return res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(0),
    })
    .json({
      success: true,
      message,
    });
};