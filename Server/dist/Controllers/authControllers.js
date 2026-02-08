"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.otpVerify = exports.signup = void 0;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../lib/prisma");
const token_1 = __importDefault(require("../jwt/token"));
const generateVeriCode_1 = require("../utils/generateVeriCode");
const sendVerificationCode_1 = require("../utils/sendVerificationCode");
const template_1 = require("../utils/template");
const sendMail_1 = require("../utils/sendMail");
const crypto_1 = __importDefault(require("crypto"));
const userSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, { message: "fullname must contain 3 to 20 characters" })
        .max(20, { message: "fullname must contain 3 to 20 characters" }),
    password: zod_1.z
        .string()
        .min(8, { message: "Password must contain atleast 8 character" }),
});
const signup = async (req, res) => {
    try {
        const { email, name, role, password } = req.body || {};
        if (!email || !name || !password) {
            return res.status(400).json({ message: "Enter all credentials" });
        }
        if (!role || !["USER", "ADMIN"].includes(role)) {
            return res.status(400).json({ message: "Choose a valid role" });
        }
        const validate = userSchema.safeParse({ email, name, password });
        if (!validate.success) {
            return res
                .status(400)
                .json({ error: validate.error.issues.map((e) => e.message) });
        }
        let user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (user && user.isEmailVerified) {
            return res.status(409).json({ message: "User already registered" });
        }
        const attempts = await prisma_1.prisma.verificationToken.count({
            where: {
                user: { email },
                type: "EMAIL_VERIFY",
                createdAt: {
                    gte: new Date(Date.now() - 60 * 60 * 1000),
                },
            },
        });
        if (attempts >= 5) {
            return res.status(429).json({
                message: "You have exceeded verification attempts. Please contact support.",
            });
        }
        if (!user) {
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    name,
                    role,
                    password: hashedPassword,
                },
            });
        }
        const { code, expiresAt } = (0, generateVeriCode_1.generateVerificationCode)();
        const hashedOtp = await bcrypt_1.default.hash(code, 10);
        await prisma_1.prisma.verificationToken.deleteMany({
            where: {
                userId: user.id,
                type: "EMAIL_VERIFY",
            },
        });
        await prisma_1.prisma.verificationToken.create({
            data: {
                userId: user.id,
                token: hashedOtp,
                type: "EMAIL_VERIFY",
                expiresAt,
            },
        });
        const codeSent = await (0, sendVerificationCode_1.sendVerificationCode)(email, code);
        if (!codeSent) {
            return res
                .status(555)
                .json({ message: "Failed to send verification code" });
        }
        return res.status(201).json({
            message: "Signup successful. Please verify your email.",
            email,
            role,
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Error in signup" });
    }
};
exports.signup = signup;
const otpVerify = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res
                .status(404)
                .json({ message: "No user exists with this email" });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }
        const verificationToken = await prisma_1.prisma.verificationToken.findFirst({
            where: {
                userId: user.id,
                type: "EMAIL_VERIFY",
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        if (!verificationToken) {
            return res.status(400).json({
                message: "No verification code found. Please request again.",
            });
        }
        if (verificationToken.expiresAt < new Date()) {
            return res.status(400).json({
                message: "Your verification code has expired",
            });
        }
        const isOtpValid = await bcrypt_1.default.compare(String(otp), verificationToken.token);
        if (!isOtpValid) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
            },
        });
        await prisma_1.prisma.verificationToken.deleteMany({
            where: {
                userId: user.id,
                type: "EMAIL_VERIFY",
            },
        });
        const token = (0, token_1.default)(user, res);
        return res.status(200).json({
            message: "OTP verification successful",
            role: user.role,
            name: user.name,
            token,
        });
    }
    catch (error) {
        console.error("Error from OTP verification:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
exports.otpVerify = otpVerify;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(404).json({ message: "User not registered" });
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid Password" });
    }
    const token = (0, token_1.default)(user, res);
    res.json({
        message: "Login successful",
        role: user.role,
        name: user.name,
        user,
        token,
    });
};
exports.login = login;
const logout = async (req, res) => {
    return res.status(200).json({
        message: "Logged out successfully",
    });
};
exports.logout = logout;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                email,
                isEmailVerified: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                message: "Verified user not found with this email",
            });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        const resetPasswordUrl = `https://quizsprint-client-side.onrender.com/reset-password/${resetToken}`;
        const message = (0, template_1.generateResetPasswordEmailTemplate)(resetPasswordUrl);
        await (0, sendMail_1.sendMail)({
            email: user.email,
            subject: "QuizSprint Password Reset",
            message,
        });
        return res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            message: "Failed to send reset email",
        });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token || !password) {
            return res.status(400).json({
                message: "Token and new password are required",
            });
        }
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!user) {
            return res.status(400).json({
                message: "Reset token is invalid or expired",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Password reset successful. You can now log in.",
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};
exports.resetPassword = resetPassword;
