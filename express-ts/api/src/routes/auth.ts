import { Response } from "express";
import { CustomRequest } from "../types/CustomRequest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
const router = express.Router();
import db from "../utility/connection.js";

// auth routes
router.post("/login", async (req: CustomRequest, res: Response) => {
  try {
    let [data] = await db.execute(
      `SELECT * FROM user WHERE username = ? OR email = ?`,
      [req.body.username, req.body.username]
    );
    let rows = JSON.parse(JSON.stringify(data));
    if (rows.length === 0) {
      res
        .status(403)
        .json(`User with username "${req.body.username}" not found`);
      return;
    }
    if (rows.length > 1) {
      res
        .status(403)
        .json(
          `There are multiple accounts with the username "${req.body.username}" \n Please use email instead!"`
        );
      return;
    }
    let user = rows[0];
    bcrypt.compare(
      req.body.password,
      user.password,
      (err: any, result: boolean) => {
        const safeUser = { ...user, password: null };

        if (err) {
          console.error(err);
          res.status(403).json(err.code);
          return;
        }
        if (result === false) {
          res.status(403).json("Password is wrong");
          return;
        }
        const accessToken = jwt.sign(
          safeUser,
          process.env.JWT_TOKEN || "changeMe"
        );
        res.cookie("jwt", accessToken).end();
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong");
  }
});

export default router;
