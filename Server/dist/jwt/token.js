"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokenAndSaveInCookies = (user, res) => {
    console.log("users role", user);
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        role: user.role,
    }, process.env.JWT_SECRET || "snehpateljwt123", { expiresIn: "10d" });
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 10 * 24 * 60 * 60 * 1000,
    });
    console.log("VERIFY TOKEN:", token);
    console.log("JWT SECRET:", process.env.JWT_SECRET);
    return token;
};
exports.default = generateTokenAndSaveInCookies;
