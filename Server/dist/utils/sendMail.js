"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = async ({ email, subject, message, }) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.BREVO_SMTP_USER,
                pass: process.env.BREVO_SMTP_PASS,
            },
        });
        const info = await transporter.sendMail({
            from: `"QuizSprint" <test.snehpatel.dev@gmail.com>`,
            to: email,
            subject,
            html: message,
        });
        console.log("SMTP accepted:", info.accepted);
        console.log("SMTP rejected:", info.rejected);
        if (!info.accepted || info.accepted.length === 0) {
            console.error("❌ Email NOT accepted by SMTP");
            return false;
        }
        return true;
    }
    catch (error) {
        console.error("❌ Email sending error:", error);
        return false;
    }
};
exports.sendMail = sendMail;
