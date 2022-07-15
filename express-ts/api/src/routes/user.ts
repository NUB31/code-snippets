import { Response } from "express";
import { CustomRequest } from "../types/CustomRequest";
import { User } from "../types/User";
const router = require("express").Router();
var db = require("../utility/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Middleware that checks if user is logged inn
const { authenticateToken } = require("../middleware/authenticateUser");

// user routes
router.get("/", authenticateToken, (req: CustomRequest, res: Response) => {
  db.query(
    "SELECT * FROM user WHERE id = ? LIMIT 1",
    [req.user.id],
    (err: any, rows: User[]) => {
      if (err) {
        console.error(err);
        res.status(500).json(err.code);
        return;
      }
      if (rows.length === 0) {
        res.status(403).json("No user found with your id");
        return;
      }
      const user = rows[0];
      const safeUser = { ...user, password: null };
      res.json(safeUser);
    }
  );
});

router.post("/", async (req: CustomRequest, res: Response) => {
  if (!req.body.password) {
    return res.status(422).json("No password");
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

  if (user.username && user.email && user.password) {
    db.query(
      "INSERT INTO user ( username, email, password, gender, picture) VALUES (?, ?, ?, ?, ?)",
      [user.username, user.email, user.password, user.gender, user.picture],
      (err: any, result: any) => {
        if (err) {
          console.error(err);
          res.status(500).json(err.code);
          return;
        }
        let safeUser = { ...req.body, password: null, id: result.insertId };
        const accessToken = jwt.sign(safeUser, process.env.JWT_TOKEN);
        res.cookie("jwt", accessToken).end();
      }
    );
  } else {
    res.status(422).json("Not enaugh details");
  }
});

router.patch(
  "/",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
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

    db.query(
      `UPDATE user SET username = COALESCE(NULLIF(?, ''), username), email = COALESCE(NULLIF(?, ''), email), picture = COALESCE(picture, ?), gender = COALESCE(NULLIF(?, ''), gender), password = COALESCE(NULLIF(?, ''), password) WHERE id = ?`,
      [
        user.username,
        user.email,
        user.picture,
        user.gender,
        user.password,
        user.id,
      ],
      (err: any) => {
        if (err) {
          console.error(err);
          res.status(500).json(err.code);
          return;
        }
        let safeUser: User = { ...req.body, password: null, id: req.user.id };
        const accessToken = jwt.sign(safeUser, process.env.JWT_TOKEN);
        res.cookie("jwt", accessToken).end();
      }
    );
  }
);

module.exports = router;
