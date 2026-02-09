import { z } from "zod";
import bcrypt from "bcrypt";
import {prisma} from "../lib/prisma";
import type { Response, Request } from "express";
import generateTokenAndSaveInCookies from "../jwt/token";
import { generateVerificationCode } from "../utils/generateVeriCode";
import { sendVerificationCode } from "../utils/sendVerificationCode";
import { generateResetPasswordEmailTemplate } from "../utils/template";
import { sendMail } from "../utils/sendMail";
import crypto from "crypto";

const userSchema = z.object({
  name: z
    .string()
    .min(3, { message: "fullname must contain 3 to 20 characters" })
    .max(20, { message: "fullname must contain 3 to 20 characters" }),

  password: z
    .string()
    .min(8, { message: "Password must contain atleast 8 character" }),
});

export const signup = async (req: Request, res: Response) => {
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

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isEmailVerified) {
      return res.status(409).json({ message: "User already registered" });
    }

    const attempts = await prisma.verificationToken.count({
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
        message:
          "You have exceeded verification attempts. Please contact support.",
      });
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          password: hashedPassword,
        },
      });
    }

    const { code, expiresAt } = generateVerificationCode();
    const hashedOtp = await bcrypt.hash(code, 10);

    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFY",
      },
    });

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: hashedOtp,
        type: "EMAIL_VERIFY",
        expiresAt,
      },
    });

    const codeSent = await sendVerificationCode(email, code);
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
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Error in signup" });
  }
};

export const otpVerify = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await prisma.user.findUnique({
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

    const verificationToken = await prisma.verificationToken.findFirst({
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

    const isOtpValid = await bcrypt.compare(
      String(otp),
      verificationToken.token,
    );

    if (!isOtpValid) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
      },
    });

    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFY",
      },
    });

    const token = generateTokenAndSaveInCookies(user, res);

    return res.status(200).json({
      message: "OTP verification successful",
      role: user.role,
      name: user.name,
      token,
    });
  } catch (error) {
    console.error("Error from OTP verification:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ message: "User not registered" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid Password" });
  }

  const token = generateTokenAndSaveInCookies(user, res);

  res.json({
    message: "Login successful",
    role: user.role,
    name: user.name,
    user,
    token,
  });
};

export const logout = async (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await prisma.user.findFirst({
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
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });


    const resetPasswordUrl = `https://quiz-sprint-client.vercel.app/reset-password/${resetToken}`;
    const message = generateResetPasswordEmailTemplate(resetPasswordUrl);

    await sendMail({
      email: user.email,
      subject: "QuizSprint Password Reset",
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Failed to send reset email",
    });
  }
};

export const resetPassword = async (req: Request<{token:string}>, res: Response ) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await prisma.user.findFirst({
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

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
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
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

