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
  var hashedPassword = await bcrypt.hash(req.body.password, 10);
  db.query(
    "INSERT INTO user ( username, email, password) VALUES (?, ?, ?)",
    [req.body.username, req.body.email, hashedPassword],
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
});

router.patch(
  "/",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
    if (req.body.password !== null && req.body.password !== "") {
      var hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    db.query(
      `UPDATE user SET username = ?, email = ?, picture = ?${
        hashedPassword !== undefined
          ? ", password = " + db.escape(hashedPassword)
          : ""
      } WHERE id = ?`,
      [req.body.username, req.body.email, req.body.picture, req.user.id],
      (err: any) => {
        if (err) {
          console.error(err);
          res.status(500).json(err.code);
          return;
        }
        let safeUser = { ...req.body, password: null, id: req.user.id };
        const accessToken = jwt.sign(safeUser, process.env.JWT_TOKEN);
        res.cookie("jwt", accessToken).end();
      }
    );
  }
);

module.exports = router;
