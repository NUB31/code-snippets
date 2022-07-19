import { Response } from "express";
import { CustomRequest } from "../types/CustomRequest";
import { User } from "../types/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import { PrismaClient } from "@prisma/client";
import authenticateToken from "../middleware/authenticateUser.js";

const router = express.Router();
const { users } = new PrismaClient();

// user routes
router.get(
  "/",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json("You are not signed in");
      return;
    }
    try {
      const user = await users.findFirst({
        where: {
          id: req.user.id?.toString(),
        },
      });
      const safeUser: User = { ...user, password: undefined };
      res.json(safeUser);
    } catch (err) {
      console.error(err);
      res.status(500).json("Something went wrong");
    }
  }
);

router.post("/", async (req: CustomRequest, res: Response) => {
  if (!req.body.password) {
    res.status(422).json("No password");
    return;
  }
  let hashedPassword: string = await bcrypt.hash(req.body.password, 10);
  let picture: string | null = req.body.picture || null;

  if (picture === null) {
    switch (req.body.gender) {
      case "male":
        picture = process.env.API_PUBLIC_URL + "/upload/default-male.svg";
        break;
      case "female":
        picture = process.env.API_PUBLIC_URL + "/upload/default-female.svg";
        break;
      default:
        break;
    }
  }

  let user: User = {
    id: "",
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    gender: req.body.gender || null,
    picture: picture,
  };

  try {
    if (user.username && user.email && user.password) {
      let result = await users.create({
        data: {
          username: user.username,
          email: user.email,
          password: user.password,
          gender: user.gender,
          picture: user.picture,
        },
      });
      let safeUser: User = { ...result, password: undefined };
      const accessToken = jwt.sign(
        safeUser,
        process.env.JWT_TOKEN || "changeMe"
      );
      res.cookie("jwt", accessToken).end();
    } else {
      res.status(422).json("Not enaugh details");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong");
  }
});

router.patch(
  "/",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
    if (!req.user) return res.status(401).json("You are not signed in");
    let user: User = {
      id: req.user.id,
      username: req.body.username || undefined,
      email: req.body.email || undefined,
      gender: req.body.gender || undefined,
      picture: req.body.picture,
    };
    if (req.body.password)
      user.password = await bcrypt.hash(req.body.password, 10);

    try {
      const data = await users.update({
        data: user,
        where: {
          id: user.id,
        },
      });
      let safeUser: User = { ...data, password: undefined };
      const accessToken = jwt.sign(
        safeUser,
        process.env.JWT_TOKEN || "changeMe"
      );
      // res.cookie("jwt", accessToken).end();
      res.cookie("jwt", accessToken).json(safeUser);
    } catch (err) {
      console.error(err);
      res.status(500).json("Something went wrong");
    }
  }
);

export default router;
