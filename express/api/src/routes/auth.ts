import { Response } from "express";
import { CustomRequest } from "../types/CustomRequest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { User } from "../types/User";

const router = express.Router();
const { users } = new PrismaClient();

router.post("/login", async (req: CustomRequest, res: Response) => {
  try {
    const data = await users.findMany({
      where: {
        OR: [{ username: req.body.username }, { email: req.body.username }],
      },
    });

    if (data.length === 0) {
      return res
        .status(401)
        .json(`User with username "${req.body.username}" not found`);
    } else if (data.length > 1) {
      return res
        .status(403)
        .json(
          `There are multiple accounts with the username/email "${req.body.username}" \n Please use email instead!"`
        );
    }

    let [user] = data;
    bcrypt.compare(
      req.body.password,
      user.password,
      (err: any, result: boolean) => {
        const safeUser: User = { ...user, password: undefined };
        if (err) {
          console.error(err);
          res.status(403).json(err.code);
          return;
        }
        if (result === false) {
          res.status(401).json("Password is wrong");
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
