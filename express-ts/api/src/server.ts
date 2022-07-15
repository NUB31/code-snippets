// imports
require("dotenv").config();
import { Response } from "express";
import { CustomRequest } from "./types/CustomRequest";
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const { authenticateToken } = require("./middleware/authenticateUser");
const fs = require("fs");

// Include routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

// Define app port
const port = process.env.PORT || 3002;

// All uploaded files will go to this path
const upload = multer({ dest: "./upload/" });

const app = express();

// You cannot use * origin when including credentials
app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_PUBLIC_URL],
  })
);

// Define public folder as folder for public files :)
app.use(express.static("public"));
app.use("/upload", express.static("upload"));

// Get access to jwt cookie
// For parsing different types of requests, and set limit high to prevent error
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: false,
    limit: "100mb",
  })
);
app.use(
  express.json({
    limit: "100mb",
  })
);

// Our main API routes
app.use("/auth", authRoute);
app.use("/user", userRoute);

// Other routes
// Upload single file
app.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  async (req: CustomRequest, res: Response) => {
    let newFileName = req.file.filename + req.file.originalname;
    fs.rename(
      `./upload/${req.file.filename}`,
      `./upload/${newFileName}`,
      () => {
        res.json({
          location: `${process.env.API_PUBLIC_URL}/upload/${newFileName}`,
        });
      }
    );
  }
);

// Listens on ENV or default port
app.listen(port, () => console.log(`Listening on port: ${port}!`));
