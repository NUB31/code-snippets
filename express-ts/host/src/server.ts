import { Request, Response } from "express";

require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const path = require("path");
const compression = require("compression");
const { countUniqueIps } = require("./middleware/countUniqueIps");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

var accessLogStream = fs.createWriteStream(
  path.join(__dirname, "..", "ipLog.txt"),
  {
    flags: "a",
  }
);

app.enable("trust proxy");
app.use(compression());
app.use(countUniqueIps);
app.use(logger("common", { stream: accessLogStream }));
app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => console.log(`Website listening on port: ${port}!`));
