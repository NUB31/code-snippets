// imports
import { Response } from "express";
import { CustomRequest } from "./types/CustomRequest";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import authenticateToken from "./middleware/authenticateUser.js";
import fs from "fs";
import dotenv from "dotenv";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";

dotenv.config();

// Define app port
const port = process.env.PORT || 3002;

// All uploaded files will go to this path
const upload = multer({ dest: "./upload/" });

const app = express();

// You cannot use * origin when including credentials
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_PUBLIC_URL,
  })
);
// Get access to jwt cookie
app.use(cookieParser());
// For parsing different types of requests, and set limit high to prevent error
app.use(
  express.json({
    limit: "100mb",
  })
);

// Main API routes
// Router routes
app.use("/auth", authRoute);
app.use("/user", userRoute);
// Set /upload endpoint to point to upload folder
app.use("/upload", express.static("upload"));

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
