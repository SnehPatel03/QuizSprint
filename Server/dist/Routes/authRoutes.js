"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authControllers_1 = require("../Controllers/authControllers");
const authorize_1 = require("../Middleware/authorize");
const route = express_1.default.Router();
route.post("/signup", authControllers_1.signup);
route.post("/login", authControllers_1.login);
route.get("/logout", authorize_1.authorize, authControllers_1.logout);
route.post('/otpverify', authControllers_1.otpVerify);
route.post('/forgotPassword', authControllers_1.forgotPassword);
route.post('/reset-password/:token', authControllers_1.resetPassword);
exports.default = route;
