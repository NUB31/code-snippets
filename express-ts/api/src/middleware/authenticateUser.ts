import { NextFunction, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { CustomRequest } from "../types/CustomRequest";
import { User } from "../types/User";

const jwt = require("jsonwebtoken");

// checks ig jwt token is real and grants access to user
export const authenticateToken = (
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
    process.env.JWT_TOKEN,
    (err: JsonWebTokenError, user: User) => {
      // if token is not valid, return to login
      if (err) return res.status(401).json("You are not signed in");
      // set the username as req.user
      req.user = user;
      // continue request
      next();
    }
  );
};
