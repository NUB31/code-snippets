import { NextFunction, Response } from "express";
import { CustomRequest } from "../types/CustomRequest.js";
import jwt from "jsonwebtoken";

// checks ig jwt token is real and grants access to user
const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // gets jwt cookie from request
  const token = req.cookies.jwt;
  // if there is no token, redirect to login
  if (token == null) return res.status(401).json("You are not signed in");
  // else check if token is valid
  jwt.verify(
    token,
    process.env.JWT_TOKEN || "changeMe",
    (err: any, decoded: any) => {
      // if token is not valid
      if (err) return res.status(401).json("You are not signed in");
      // Set req.user as the user object extracted from the token
      req.user = decoded;
      // continue request
      next();
    }
  );
};

export default authenticateToken;
