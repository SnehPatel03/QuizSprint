"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationCode = sendVerificationCode;
const template_1 = require("./template");
const sendMail_1 = require("./sendMail");
async function sendVerificationCode(email, verificationCode) {
    try {
        const message = (0, template_1.generateVerificationCodeEmailTemplate)(verificationCode);
        return await (0, sendMail_1.sendMail)({
            email,
            subject: "Verify your QuizSprint account",
            message,
        });
        return true;
    }
    catch (error) {
        console.error("error in sending verification code:", error);
        return false;
    }
}
