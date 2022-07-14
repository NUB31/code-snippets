import { Response } from "express";
import { CustomRequest } from "../types/CustomRequest";
const router = require("express").Router();
var db = require("../utility/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { User } from "../types/User";

// auth routes
router.post("/login", (req: CustomRequest, res: Response) => {
  db.query(
    `SELECT * FROM user WHERE username = ? OR email = ?`,
    [req.body.username, req.body.username],
    (err: any, rows: User[]) => {
      if (err) {
        console.error(err);
        res.status(500).json(err.code);
        return;
      }
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
          const accessToken = jwt.sign(safeUser, process.env.JWT_TOKEN);
          res.cookie("jwt", accessToken).end();
        }
      );
    }
  );
});

module.exports = router;
