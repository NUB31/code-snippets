import { Response } from "express";
import { CustomRequest } from "../types/CustomRequest";
import { User } from "../types/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
const router = express.Router();
import db from "../utility/connection.js";

// Middleware that checks if user is logged inn
import authenticateToken from "../middleware/authenticateUser.js";
import { QueryError } from "mysql2";

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
      let [data] = await db.query("SELECT * FROM user WHERE id = ? LIMIT 1", [
        req.user.id,
      ]);

      let rows = JSON.parse(JSON.stringify(data));
      if (rows.length === 0) {
        res.status(401).json("No user found with your id");
        return;
      }
      const user = rows[0];
      const safeUser = { ...user, password: null };
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
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    gender: req.body.gender || null,
    picture: picture,
  };

  try {
    if (user.username && user.email && user.password) {
      let [data] = await db.query(
        "INSERT INTO user ( username, email, password, gender, picture) VALUES (?, ?, ?, ?, ?)",
        [user.username, user.email, user.password, user.gender, user.picture]
      );
      let result = JSON.parse(JSON.stringify(data));
      let safeUser = { ...req.body, password: null, id: result.insertId };
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
    if (!req.user) {
      res.status(401).json("You are not signed in");
      return;
    }
    let hashedPassword: string = "";
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    let picture: string | null = null;
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

    let user: User = {
      id: req.user.id,
      username: req.body.username || null,
      email: req.body.email || null,
      password: hashedPassword,
      gender: req.body.gender || null,
      picture: req.body.picture || picture,
    };
    try {
      await db.query(
        `UPDATE user SET username = COALESCE(NULLIF(?, ''), username), email = COALESCE(NULLIF(?, ''), email), picture = COALESCE(picture, ?), gender = COALESCE(NULLIF(?, ''), gender), password = COALESCE(NULLIF(?, ''), password) WHERE id = ?`,
        [
          user.username,
          user.email,
          user.picture,
          user.gender,
          user.password,
          user.id,
        ]
      );
      if (req.user) {
        let safeUser: User = { ...req.body, password: null, id: req.user.id };
        const accessToken = jwt.sign(
          safeUser,
          process.env.JWT_TOKEN || "changeMe"
        );
        res.cookie("jwt", accessToken).end();
      } else {
        res.status(500).json("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      res.status(500).json("Something went wrong");
    }
  }
);

export default router;
