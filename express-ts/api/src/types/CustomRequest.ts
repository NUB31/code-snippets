import { Request } from "express";
import { User } from "./User";

export interface CustomRequest extends Request {
  user: User;
  file: any;
}
