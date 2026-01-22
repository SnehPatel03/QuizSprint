import { NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authorize = (req:Request | any, res:Response | any, next:NextFunction) => {


  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; 

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token"
    });
  }
};
